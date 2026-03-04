import { getDb } from "./_db.js";
import { ObjectId } from "mongodb";
import { hashToken } from "./_reviewToken.js";

const RATE_LIMIT = new Map();
function json(statusCode, body) {
	return {
		statusCode,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	};
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "POST") {
			return json(405, { ok: false, error: "Method Not Allowed" });
		}

		const payload = JSON.parse(event.body || "{}");
		const quoteId = String(payload.quoteId || "").trim();
		const token = String(payload.token || "").trim();
		const rating = Number(payload.rating || 0);
		const text = String(payload.text || "").trim();
		const name = String(payload.name || "").trim();
		const ip = event.headers["x-forwarded-for"] || "unknown";
		const now = Date.now();

		if (RATE_LIMIT.has(ip) && now - RATE_LIMIT.get(ip) < 5000) {
			return json(429, { ok: false, error: "Too many requests" });
		}

		RATE_LIMIT.set(ip, now);

		if (!quoteId || quoteId.length !== 24) {
			return json(400, { ok: false, error: "Invalid quoteId" });
		}
		if (!token) {
			return json(400, { ok: false, error: "Missing token" });
		}
		if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
			return json(400, { ok: false, error: "Rating must be 1–5" });
		}

		const secret = process.env.REVIEW_TOKEN_SECRET;
		if (!secret) {
			return json(500, {
				ok: false,
				error: "Server missing token secret",
			});
		}

		const db = await getDb();
		const _id = new ObjectId(quoteId);

		const quote = await db.collection("quotes").findOne({ _id });
		if (!quote) return json(404, { ok: false, error: "Quote not found" });

		// Must be completed (your system requirement)
		if (String(quote.status || "") !== "completed") {
			return json(400, { ok: false, error: "Quote not completed yet" });
		}

		const reviewInfo = quote.review || {};
		if (!reviewInfo.tokenHash || !reviewInfo.tokenExpiresAt) {
			return json(400, { ok: false, error: "Review link not active" });
		}

		// Expiration
		const expMs = new Date(reviewInfo.tokenExpiresAt).getTime();
		if (!Number.isFinite(expMs) || Date.now() > expMs) {
			return json(400, { ok: false, error: "Review link expired" });
		}

		// Validate token
		const submittedHash = hashToken(token, secret);
		if (submittedHash !== reviewInfo.tokenHash) {
			return json(401, { ok: false, error: "Invalid token" });
		}

		// Prevent double submit
		if (reviewInfo.submittedAt || reviewInfo.reviewId) {
			return json(400, { ok: false, error: "Review already submitted" });
		}

		const now = new Date();

		// Create review doc (source of truth)
		const reviewDoc = {
			quoteId: _id,
			rating,
			text,
			name,
			status: "pending",
			submittedAt: now,
			service: quote.service || "",
		};

		const insertRes = await db.collection("reviews").insertOne(reviewDoc);
		const reviewId = insertRes.insertedId;

		// Update quote snapshot
		await db.collection("quotes").updateOne(
			{ _id },
			{
				$set: {
					"review.submittedAt": now,
					"review.status": "pending",
					"review.reviewId": reviewId,
				},
				$unset: {
					"review.tokenHash": "",
					"review.tokenExpiresAt": "",
				},
			},
		);

		return json(200, { ok: true, reviewId: reviewId.toString() });
	} catch (err) {
		console.error("public-submit-review error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};
