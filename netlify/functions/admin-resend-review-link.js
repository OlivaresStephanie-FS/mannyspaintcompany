import { getDb } from "./_db.js";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import { makeReviewToken, hashToken } from "./_reviewToken.js";

function isValidBearer(event) {
	const expected = process.env.ADMIN_TOKEN;
	const auth =
		event.headers?.authorization || event.headers?.Authorization || "";

	console.log(
		"UPDATE STATUS auth header prefix:",
		auth ? auth.slice(0, 20) : "(empty)",
	);
	console.log("UPDATE STATUS expected token set?:", !!expected);
	console.log(
		"UPDATE STATUS expected length:",
		expected ? expected.length : 0,
	);

	if (!expected) return false;
	if (!auth.startsWith("Bearer ")) return false;
	const token = auth.slice("Bearer ".length).trim();

	console.log("UPDATE STATUS token length:", token.length);
	console.log("UPDATE STATUS match?:", token === expected);

	return token === expected;
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
			return { statusCode: 405, body: "Method Not Allowed" };
		}

		if (!isValidBearer(event)) {
			return { statusCode: 401, body: "Unauthorized" };
		}

		const { quoteId } = JSON.parse(event.body || "{}");

		if (!quoteId || quoteId.length !== 24) {
			return { statusCode: 400, body: "Invalid quoteId" };
		}

		const db = await getDb();
		const _id = new ObjectId(quoteId);

		const quote = await db.collection("quotes").findOne({ _id });

		if (!quote) {
			return { statusCode: 404, body: "Quote not found" };
		}

		if (quote.status !== "completed") {
			return { statusCode: 400, body: "Quote not completed yet" };
		}

		if (!quote.email) {
			return { statusCode: 400, body: "No client email on file" };
		}

		const secret = process.env.REVIEW_TOKEN_SECRET;
		const ttlDays = Number(process.env.REVIEW_TOKEN_TTL_DAYS) || 30;
		const siteUrl = String(process.env.PUBLIC_SITE_URL || "").replace(
			/\/+$/,
			"",
		);

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

		return {
			statusCode: 200,
			body: JSON.stringify({ ok: true }),
		};
	} catch (err) {
		console.error("admin-resend-review-link error:", err);
		return { statusCode: 500, body: "Server error" };
	}
};
