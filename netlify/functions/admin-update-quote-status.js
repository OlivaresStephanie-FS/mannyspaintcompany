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

// Status transition rules (forward + backward) + allow new -> scheduled
const ORDER = ["new", "contacted", "scheduled", "completed"];
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

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "PATCH") {
			return {
				statusCode: 405,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
				},
				body: JSON.stringify({
					ok: false,
					error: "Method Not Allowed",
				}),
			};
		}

		if (!isValidBearer(event)) {
			return {
				statusCode: 401,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
				},
				body: JSON.stringify({ ok: false, error: "Unauthorized" }),
			};
		}

		const { quoteId, status } = JSON.parse(event.body || "{}");

		if (!quoteId || typeof quoteId !== "string" || quoteId.length !== 24) {
			return {
				statusCode: 400,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
				},
				body: JSON.stringify({
					ok: false,
					error: "Invalid quoteId format",
				}),
			};
		}

		if (!ALLOWED.has(status)) {
			return {
				statusCode: 400,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
				},
				body: JSON.stringify({ ok: false, error: "Invalid status" }),
			};
		}

		const db = await getDb();
		const _id = new ObjectId(quoteId);

		const current = await db.collection("quotes").findOne({ _id });
		if (!current) {
			return {
				statusCode: 404,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
				},
				body: JSON.stringify({ ok: false, error: "Quote not found" }),
			};
		}

		const fromStatus = current.status || "new";
		if (!isAllowedTransition(fromStatus, status)) {
			return {
				statusCode: 400,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
				},
				body: JSON.stringify({
					ok: false,
					error: `Invalid status transition: ${fromStatus} → ${status}`,
				}),
			};
		}

		const now = new Date();

		// --- Review request logic (only when moving into "completed") ---
		const reviewEnabled =
			String(process.env.REVIEW_EMAIL_ENABLED || "true") === "true";

		const siteUrl = String(process.env.PUBLIC_SITE_URL || "").replace(
			/\/+$/,
			"",
		);
		const secret = process.env.REVIEW_TOKEN_SECRET;

		// TTL (days) with safe fallback
		const ttlDaysRaw = Number(process.env.REVIEW_TOKEN_TTL_DAYS);
		const ttlDays =
			Number.isFinite(ttlDaysRaw) && ttlDaysRaw > 0 ? ttlDaysRaw : 30;

		// send only when first moving into completed AND we haven't requested before
		const shouldRequestReview =
			status === "completed" &&
			reviewEnabled &&
			!!current.email &&
			siteUrl &&
			secret &&
			!current.review?.requestedAt && // ✅ do not resend
			!current.review?.tokenHash;

		// ✅ repair expiry if an older record saved epoch/invalid date (no resend, no new token)
		const existingExpiresMs = current.review?.tokenExpiresAt
			? new Date(current.review.tokenExpiresAt).getTime()
			: NaN;

		const hasBadExpiry =
			!Number.isFinite(existingExpiresMs) ||
			existingExpiresMs <= 24 * 60 * 60 * 1000;

		const shouldRepairExpiry =
			status === "completed" &&
			!!current.review?.tokenHash &&
			hasBadExpiry &&
			secret;

		let reviewLink = "";
		let reviewPatch = {}; // only added if shouldRequestReview is true

		// optional repair patch for tokenExpiresAt only
		let repairPatch = {}; // only added if shouldRepairExpiry is true

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

		// ✅ statusUpdatedAt always; ✅ completedAt only set once
		// ✅ include repairPatch so tokenExpiresAt can be fixed if it was saved as epoch
		await db.collection("quotes").updateOne({ _id }, [
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

		// Send review email AFTER DB update succeeds
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

		const updated = await db.collection("quotes").findOne({ _id });

		return {
			statusCode: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store",
			},
			body: JSON.stringify({ ok: true, quote: updated }),
		};
	} catch (err) {
		console.error("admin-update-quote-status error:", err);
		return {
			statusCode: 500,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store",
			},
			body: JSON.stringify({ ok: false, error: "Server error" }),
		};
	}
};
