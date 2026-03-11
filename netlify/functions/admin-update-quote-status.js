import { getDb } from "./_db.js";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import { makeReviewToken, hashToken } from "./_reviewToken.js";
import jwt from "jsonwebtoken";

const ALLOWED = new Set([
	"new",
	"contacted",
	"scheduled",
	"completed",
	"archived",
]);

const ORDER = ["new", "contacted", "scheduled", "completed"];

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

function isAllowedTransition(fromStatus, toStatus) {
	const from = fromStatus || "new";
	const to = toStatus;

	if (!ALLOWED.has(from) || !ALLOWED.has(to)) return false;
	if (from === to) return true;

	if (to === "archived") return true;

	if (from === "archived") {
		return to === "contacted";
	}

	if (from === "new" && to === "scheduled") return true;

	const i = ORDER.indexOf(from);
	const j = ORDER.indexOf(to);
	if (i === -1 || j === -1) return false;

	return Math.abs(i - j) === 1;
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
    <h2 style="margin:0 0 10px;">Quick favor? ⭐</h2>
    <p style="margin:0 0 12px;">
      Hi ${escapeHtml(name || "there")},<br/>
      Thanks again for choosing Manny’s Painting Company for your ${escapeHtml(
			service || "project",
		)}.
      If you have a minute, we’d really appreciate a quick review.
    </p>

    <p style="margin:16px 0;">
      <a href="${reviewLink}"
         style="display:inline-block;padding:12px 16px;border-radius:10px;background:#111;color:#fff;text-decoration:none;">
        Leave a review
      </a>
    </p>

    <p style="margin:16px 0 0;color:#555;font-size:13px;">
      This link expires in 30 days.
    </p>
  </div>
  `;
}

function buildActivityBase(current, now) {
	return {
		quoteId: current._id,
		quoteIdString: String(current._id),
		clientName: current.name || "",
		clientEmail: current.email || "",
		service: current.service || "",
		createdAt: now,
		source: "admin",
	};
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "PATCH") {
			return json(405, {
				ok: false,
				error: "Method Not Allowed",
			});
		}

		if (!isValidBearer(event)) {
			return json(401, {
				ok: false,
				error: "Unauthorized",
			});
		}

		const { quoteId, status } = JSON.parse(event.body || "{}");

		if (!quoteId || typeof quoteId !== "string" || quoteId.length !== 24) {
			return json(400, {
				ok: false,
				error: "Invalid quoteId format",
			});
		}

		if (!ALLOWED.has(status)) {
			return json(400, { ok: false, error: "Invalid status" });
		}

		const db = await getDb();
		const _id = new ObjectId(quoteId);

		const quotes = db.collection("quotes");
		const activity = db.collection("activity");

		const current = await quotes.findOne({ _id });

		if (!current) {
			return json(404, { ok: false, error: "Quote not found" });
		}

		const fromStatus = current.status || "new";

		if (!isAllowedTransition(fromStatus, status)) {
			return json(400, {
				ok: false,
				error: `Invalid status transition: ${fromStatus} → ${status}`,
			});
		}

		const now = new Date();

		const reviewEnabled =
			String(process.env.REVIEW_EMAIL_ENABLED || "true") === "true";

		const siteUrl = String(process.env.PUBLIC_SITE_URL || "").replace(
			/\/+$/,
			"",
		);

		const secret = process.env.REVIEW_TOKEN_SECRET;

		const ttlDaysRaw = Number(process.env.REVIEW_TOKEN_TTL_DAYS);
		const ttlDays =
			Number.isFinite(ttlDaysRaw) && ttlDaysRaw > 0 ? ttlDaysRaw : 30;

		const shouldRequestReview =
			status === "completed" &&
			reviewEnabled &&
			!!current.email &&
			siteUrl &&
			secret &&
			!current.review?.requestedAt &&
			!current.review?.tokenHash &&
			!current.review?.submittedAt &&
			!current.review?.reviewId;

		const existingExpiresMs = current.review?.tokenExpiresAt
			? new Date(current.review.tokenExpiresAt).getTime()
			: NaN;

		const hasBadExpiry =
			!Number.isFinite(existingExpiresMs) ||
			existingExpiresMs <= now.getTime();

		const shouldRepairExpiry =
			status === "completed" &&
			!!current.review?.tokenHash &&
			hasBadExpiry &&
			secret;

		let reviewLink = "";
		let reviewPatch = {};
		let repairPatch = {};

		if (shouldRequestReview) {
			const rawToken = makeReviewToken();
			const tokenHash = hashToken(rawToken, secret);

			const tokenExpiresAt = new Date(
				now.getTime() + ttlDays * 24 * 60 * 60 * 1000,
			);

			reviewLink = `${siteUrl}/review/${quoteId}?token=${rawToken}`;

			reviewPatch = {
				"review.requestedAt": now,
				"review.tokenHash": tokenHash,
				"review.tokenExpiresAt": tokenExpiresAt,
			};
		} else if (shouldRepairExpiry) {
			repairPatch = {
				"review.tokenExpiresAt": new Date(
					now.getTime() + ttlDays * 24 * 60 * 60 * 1000,
				),
			};
		}

		await quotes.updateOne({ _id }, [
			{
				$set: {
					status,
					statusUpdatedAt: now,
					completedAt: {
						$cond: [
							{ $eq: [status, "completed"] },
							{ $ifNull: ["$completedAt", now] },
							"$completedAt",
						],
					},
					...reviewPatch,
					...repairPatch,
				},
			},
		]);

		if (shouldRequestReview) {
			const transporter = createTransporter();

			if (transporter) {
				const subject =
					process.env.REVIEW_EMAIL_SUBJECT || "How did we do? ⭐";

				await transporter.sendMail({
					from: `"${process.env.NOTIFY_EMAIL_FROM_NAME || "Manny’s Painting"}" <${process.env.SMTP_USER}>`,
					to: String(current.email).trim(),
					replyTo: process.env.SMTP_USER,
					subject,
					html: buildReviewEmailHtml({
						name: current.name,
						service: current.service,
						reviewLink,
					}),
				});
			} else {
				console.log("📧 Review email skipped: missing SMTP config");
			}
		}

		const activityDocs = [];

		if (fromStatus !== status) {
			activityDocs.push({
				...buildActivityBase(current, now),
				type: "quote_status_changed",
				title: "Quote status changed",
				message: `${fromStatus} → ${status}`,
				fromStatus,
				toStatus: status,
			});
		}

		if (fromStatus !== "completed" && status === "completed") {
			activityDocs.push({
				...buildActivityBase(current, now),
				type: "quote_completed",
				title: "Quote marked completed",
				message: "Quote moved to completed",
				fromStatus,
				toStatus: status,
			});
		}

		if (shouldRequestReview) {
			activityDocs.push({
				...buildActivityBase(current, now),
				type: "review_requested",
				title: "Review request sent",
				message: "Review email sent to client",
				reviewStatus: current.review?.status || "",
				toStatus: status,
			});
		}

		if (activityDocs.length) {
			await activity.insertMany(activityDocs);
		}

		const updated = await quotes.findOne({ _id });

		return json(200, { ok: true, quote: updated });
	} catch (err) {
		console.error("admin-update-quote-status error:", err);

		return json(500, {
			ok: false,
			error: "Server error",
		});
	}
};
