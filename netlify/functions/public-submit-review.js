import { getDb } from "./_db.js";
import { ObjectId } from "mongodb";
import { hashToken } from "./_reviewToken.js";

const RATE_LIMIT = new Map();

function json(statusCode, body) {
	return {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "no-store",
		},
		body: JSON.stringify(body),
	};
}

function getClientIp(event) {
	const forwarded =
		event.headers?.["x-forwarded-for"] ||
		event.headers?.["X-Forwarded-For"] ||
		"";

	return String(forwarded).split(",")[0].trim() || "unknown";
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

		const ip = getClientIp(event);
		const nowMs = Date.now();
		const now = new Date();

		if (RATE_LIMIT.has(ip) && nowMs - RATE_LIMIT.get(ip) < 5000) {
			return json(429, { ok: false, error: "Too many requests" });
		}

		RATE_LIMIT.set(ip, nowMs);

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
		const quotes = db.collection("quotes");
		const reviews = db.collection("reviews");
		const activity = db.collection("activity");

		const _id = new ObjectId(quoteId);
		const quote = await quotes.findOne({ _id });

		if (!quote) {
			return json(404, { ok: false, error: "Quote not found" });
		}

		if (String(quote.status || "") !== "completed") {
			return json(400, { ok: false, error: "Quote not completed yet" });
		}

		const reviewInfo = quote.review || {};

		if (!reviewInfo.tokenHash || !reviewInfo.tokenExpiresAt) {
			return json(400, { ok: false, error: "Review link not active" });
		}

		const expMs = new Date(reviewInfo.tokenExpiresAt).getTime();
		if (!Number.isFinite(expMs) || Date.now() > expMs) {
			return json(400, { ok: false, error: "Review link expired" });
		}

		const submittedHash = hashToken(token, secret);
		if (submittedHash !== reviewInfo.tokenHash) {
			return json(401, { ok: false, error: "Invalid token" });
		}

		if (reviewInfo.submittedAt || reviewInfo.reviewId) {
			return json(400, { ok: false, error: "Review already submitted" });
		}

		const reviewDoc = {
			quoteId: _id,
			rating,
			text,
			name,
			status: "pending",
			submittedAt: now,
			service: quote.service || "",
			email: quote.email || "",
		};

		const insertRes = await reviews.insertOne(reviewDoc);
		const reviewId = insertRes.insertedId;

		await quotes.updateOne(
			{ _id },
			{
				$set: {
					"review.submittedAt": now,
					"review.status": "pending",
					"review.reviewId": reviewId,
					"review.rating": rating,
				},
				$unset: {
					"review.tokenHash": "",
					"review.tokenExpiresAt": "",
				},
			},
		);

		await activity.insertOne({
			type: "review_submitted",
			title: "Review submitted",
			message: `Client submitted a ${rating}-star review`,
			source: "public",
			createdAt: now,
			reviewId,
			reviewIdString: String(reviewId),
			quoteId: _id,
			quoteIdString: String(_id),
			clientName: name || quote.name || "",
			clientEmail: quote.email || "",
			service: quote.service || "",
			rating,
		});

		return json(200, { ok: true, reviewId: reviewId.toString() });
	} catch (err) {
		console.error("public-submit-review error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};
