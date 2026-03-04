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

function buildReviewEmailHtml({ name, service, reviewLink }) {
	return `
	<div style="font-family:Arial,sans-serif;">
		<h2>We'd love your feedback ⭐</h2>
		<p>Hi ${name || "there"},</p>
		<p>
			If you have a minute, please leave us a quick review for your ${service}.
		</p>
		<p>
			<a href="${reviewLink}" 
			   style="padding:12px 16px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
				Leave a review
			</a>
		</p>
		<p style="font-size:13px;color:#555;">
			This link expires in 30 days.
		</p>
	</div>
	`;
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "PATCH") {
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
		const _id = new ObjectId(quoteId);

		const quote = await db.collection("quotes").findOne({ _id });
		if (!quote) return json(404, { ok: false, error: "Quote not found" });

		if (quote.status !== "completed") {
			return json(400, { ok: false, error: "Quote not completed yet" });
		}

		if (!quote.email) {
			return json(400, { ok: false, error: "No client email on file" });
		}

		const secret = process.env.REVIEW_TOKEN_SECRET;
		const ttlDays = Number(process.env.REVIEW_TOKEN_TTL_DAYS) || 30;
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

		await db.collection("quotes").updateOne(
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
				from: `"Manny’s Painting" <${process.env.SMTP_USER}>`,
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
		}

		return json(200, { ok: true });
	} catch (err) {
		console.error("admin-resend-review-link error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};
