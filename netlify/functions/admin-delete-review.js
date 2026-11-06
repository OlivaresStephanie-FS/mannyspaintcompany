import { getDb } from "./_db.js";
import { ObjectId } from "mongodb";
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

function isObjectIdString(value) {
	const id = String(value || "").trim();
	return id.length === 24 && ObjectId.isValid(id);
}

function associationCleared(quote) {
	const review = quote?.review || {};
	const reviewId = review.reviewId;
	const status = review.status;
	const rating = review.rating;

	const reviewIdCleared =
		reviewId === null ||
		reviewId === undefined ||
		String(reviewId).trim() === "";
	const statusCleared =
		status === null || status === undefined || String(status).trim() === "";
	const ratingCleared = rating === null || rating === undefined;

	return (
		reviewIdCleared &&
		statusCleared &&
		ratingCleared &&
		!review.submittedAt &&
		!review.moderatedAt &&
		!review.tokenHash &&
		!review.tokenExpiresAt
	);
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "DELETE") {
			return json(405, { ok: false, error: "Method Not Allowed" });
		}

		if (!isValidBearer(event)) {
			return json(401, { ok: false, error: "Unauthorized" });
		}

		let body = {};
		try {
			body = JSON.parse(event.body || "{}");
		} catch {
			return json(400, { ok: false, error: "Invalid request body" });
		}

		const reviewId = String(body.reviewId || "").trim();
		if (!isObjectIdString(reviewId)) {
			return json(400, { ok: false, error: "Invalid reviewId" });
		}

		const db = await getDb();
		const _id = new ObjectId(reviewId);
		const reviews = db.collection("reviews");
		const quotes = db.collection("quotes");

		const review = await reviews.findOne({ _id });
		if (!review) {
			return json(404, { ok: false, error: "Review not found" });
		}

		let quoteObjectId = null;
		if (review.quoteId !== null && review.quoteId !== undefined) {
			const quoteId = String(review.quoteId).trim();
			if (!isObjectIdString(quoteId)) {
				return json(500, {
					ok: false,
					error: "Could not clear the quote's review link. The review was not removed.",
				});
			}
			quoteObjectId = new ObjectId(quoteId);
		}

		if (quoteObjectId) {
			const quote = await quotes.findOne({ _id: quoteObjectId });

			if (quote) {
				await quotes.updateOne(
					{ _id: quoteObjectId },
					{
						$set: {
							"review.reviewId": null,
							"review.submittedAt": null,
							"review.status": null,
							"review.rating": null,
							"review.moderatedAt": null,
							"review.tokenHash": null,
							"review.tokenExpiresAt": null,
						},
					},
				);

				const fresh = await quotes.findOne({ _id: quoteObjectId });
				if (!fresh || !associationCleared(fresh)) {
					return json(500, {
						ok: false,
						error: "Could not clear the quote's review link. The review was not removed.",
					});
				}
			}
		}

		const deleted = await reviews.deleteOne({ _id });
		if (deleted.deletedCount !== 1) {
			return json(500, {
				ok: false,
				error: "Could not delete review.",
			});
		}

		return json(200, { ok: true, reviewId });
	} catch (err) {
		console.error("admin-delete-review error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};
