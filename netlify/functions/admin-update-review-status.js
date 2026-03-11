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

const ALLOWED = new Set(["pending", "approved", "rejected"]);

function buildActivityBase(review, now) {
	return {
		reviewId: review._id,
		reviewIdString: String(review._id),
		quoteId: review.quoteId || null,
		quoteIdString: review.quoteId ? String(review.quoteId) : "",
		clientName: review.name || "",
		clientEmail: review.email || "",
		service: review.service || "",
		createdAt: now,
		source: "admin",
		rating: Number(review.rating || 0) || 0,
		ratingSnapshot: Number(review.rating || 0) || 0,
	};
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "PATCH") {
			return json(405, { ok: false, error: "Method Not Allowed" });
		}

		if (!isValidBearer(event)) {
			return json(401, { ok: false, error: "Unauthorized" });
		}

		const { reviewId, status } = JSON.parse(event.body || "{}");

		if (!reviewId || String(reviewId).length !== 24) {
			return json(400, { ok: false, error: "Invalid reviewId" });
		}

		if (!ALLOWED.has(status)) {
			return json(400, { ok: false, error: "Invalid status" });
		}

		const db = await getDb();
		const reviews = db.collection("reviews");
		const quotes = db.collection("quotes");
		const activity = db.collection("activity");

		const _id = new ObjectId(reviewId);
		const review = await reviews.findOne({ _id });

		if (!review) {
			return json(404, { ok: false, error: "Review not found" });
		}

		const previousStatus = review.status || "pending";
		const now = new Date();

		const patch = {
			status,
			updatedAt: now,
			approvedAt: status === "approved" ? now : null,
			rejectedAt: status === "rejected" ? now : null,
		};

		await reviews.updateOne({ _id }, { $set: patch });

		if (review.quoteId) {
			await quotes.updateOne(
				{ _id: review.quoteId },
				{
					$set: {
						"review.status": status,
						"review.moderatedAt": now,
					},
				},
			);
		}

		const activityDocs = [];

		if (previousStatus !== status && status === "approved") {
			activityDocs.push({
				...buildActivityBase(review, now),
				type: "review_approved",
				title: "Review approved",
				message: "Review was approved for public display",
				fromStatus: previousStatus,
				toStatus: status,
				reviewStatus: status,
			});
		}

		if (previousStatus !== status && status === "rejected") {
			activityDocs.push({
				...buildActivityBase(review, now),
				type: "review_rejected",
				title: "Review rejected",
				message: "Review was rejected during moderation",
				fromStatus: previousStatus,
				toStatus: status,
				reviewStatus: status,
			});
		}

		if (activityDocs.length) {
			await activity.insertMany(activityDocs);
		}

		const updated = await reviews.findOne({ _id });

		return json(200, { ok: true, review: updated });
	} catch (err) {
		console.error("admin-update-review-status error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};
