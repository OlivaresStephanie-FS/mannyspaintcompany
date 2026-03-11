import { getDb } from "./_db.js";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import { makeReviewToken, hashToken } from "./_reviewToken.js";
import jwt from "jsonwebtoken";

function json(statusCode, body) {
	return {
		statusCode,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "no-store",
		},
		body: JSON.stringify(body),
	};
}

function isValidBearer(event) {
	const auth =
		event.headers?.authorization || event.headers?.Authorization || "";
	if (!auth.startsWith("Bearer ")) return false;

	const token = auth.slice("Bearer ".length).trim();
	if (!token) return false;

	const secret = process.env.ADMIN_JWT_SECRET;
	if (!secret) return false;

	try {
		jwt.verify(token, secret);
		return true;
	} catch {
		return false;
	}
}

function createTransporter() {
	const host = process.env.SMTP_HOST;
	const port = Number(process.env.SMTP_PORT || 465);
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	if (!host || !user || !pass) return null;

	return nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: { user, pass },
	});
}

function escapeHtml(s = "") {
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function buildReviewEmailHtml({ name, service, reviewLink }) {
	return `
	<div style="font-family:Arial,sans-serif;line-height:1.4;color:#111;">
		<h2 style="margin:0 0 10px;">We'd love your feedback ⭐</h2>
		<p style="margin:0 0 12px;">Hi ${escapeHtml(name || "there")},</p>
		<p style="margin:0 0 12px;">
			If you have a minute, please leave us a quick review for your ${escapeHtml(service || "project")}.
		</p>
		<p style="margin:16px 0;">
			<a href="${reviewLink}" 
			   style="display:inline-block;padding:12px 16px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
				Leave a review
			</a>
		</p>
		<p style="font-size:13px;color:#555;margin:16px 0 0;">
			This link expires in 30 days.
		</p>
	</div>
	`;
}

function buildActivityBase(quote, now) {
	return {
		quoteId: quote._id,
		quoteIdString: String(quote._id),
		clientName: quote.name || "",
		clientEmail: quote.email || "",
		service: quote.service || "",
		createdAt: now,
		source: "admin",
	};
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "PATCH" && event.httpMethod !== "POST") {
			return json(405, { ok: false, error: "Method Not Allowed" });
		}

		if (!isValidBearer(event)) {
			return json(401, { ok: false, error: "Unauthorized" });
		}

		const { quoteId } = JSON.parse(event.body || "{}");

		if (!quoteId || quoteId.length !== 24) {
			return json(400, { ok: false, error: "Invalid quoteId" });
		}

		const db = await getDb();
		const quotes = db.collection("quotes");
		const activity = db.collection("activity");
		const _id = new ObjectId(quoteId);

		const quote = await quotes.findOne({ _id });
		if (!quote) return json(404, { ok: false, error: "Quote not found" });

		if (quote.status !== "completed") {
			return json(400, { ok: false, error: "Quote not completed yet" });
		}

		if (!quote.email) {
			return json(400, { ok: false, error: "No client email on file" });
		}

		if (quote.review?.submittedAt || quote.review?.reviewId) {
			return json(400, {
				ok: false,
				error: "Review already submitted for this quote",
			});
		}

		const secret = process.env.REVIEW_TOKEN_SECRET;
		const ttlDaysRaw = Number(process.env.REVIEW_TOKEN_TTL_DAYS);
		const ttlDays =
			Number.isFinite(ttlDaysRaw) && ttlDaysRaw > 0 ? ttlDaysRaw : 30;

		const siteUrl = String(process.env.PUBLIC_SITE_URL || "").replace(
			/\/+$/,
			"",
		);

		if (!secret || !siteUrl) {
			return json(500, {
				ok: false,
				error: "Review link not configured",
			});
		}

		const rawToken = makeReviewToken();
		const tokenHash = hashToken(rawToken, secret);

		const now = new Date();
		const tokenExpiresAt = new Date(
			now.getTime() + ttlDays * 24 * 60 * 60 * 1000,
		);

		await quotes.updateOne(
			{ _id },
			{
				$set: {
					"review.requestedAt": now,
					"review.tokenHash": tokenHash,
					"review.tokenExpiresAt": tokenExpiresAt,
				},
			},
		);

		const reviewLink = `${siteUrl}/review/${quoteId}?token=${rawToken}`;

		const transporter = createTransporter();
		if (transporter) {
			await transporter.sendMail({
				from: `"${process.env.NOTIFY_EMAIL_FROM_NAME || "Manny’s Painting"}" <${process.env.SMTP_USER}>`,
				to: quote.email,
				replyTo: process.env.SMTP_USER,
				subject:
					process.env.REVIEW_EMAIL_SUBJECT || "How did we do? ⭐",
				html: buildReviewEmailHtml({
					name: quote.name,
					service: quote.service,
					reviewLink,
				}),
			});
		} else {
			console.log("📧 Review resend email skipped: missing SMTP config");
		}

		await activity.insertOne({
			...buildActivityBase(quote, now),
			type: "review_requested",
			title: "Review request re-sent",
			message: "Review email re-sent to client from admin",
			reviewStatus: quote.review?.status || "",
			toStatus: quote.status || "",
		});

		return json(200, { ok: true });
	} catch (err) {
		console.error("admin-resend-review-link error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};
