import { getDb } from "./_db.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

function json(statusCode, body) {
	return {
		statusCode,
		headers: {
			"Content-Type": "application/json",
			// Admin endpoints should NOT be cached
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
		const _id = new ObjectId(reviewId);

		const review = await db.collection("reviews").findOne({ _id });
		if (!review) return json(404, { ok: false, error: "Review not found" });

		const now = new Date();

		// ✅ single source of truth for moderation timestamps
		const patch = {
			status,
			updatedAt: now,
			approvedAt: status === "approved" ? now : null,
			rejectedAt: status === "rejected" ? now : null,
		};

		await db.collection("reviews").updateOne({ _id }, { $set: patch });

		// ✅ Keep quote snapshot consistent (only if quoteId exists)
		if (review.quoteId) {
			await db.collection("quotes").updateOne(
				{ _id: review.quoteId },
				{
					$set: {
						"review.status": status,
						"review.moderatedAt": now,
					},
				},
			);
		}

		const updated = await db.collection("reviews").findOne({ _id });

		return json(200, { ok: true, review: updated });
	} catch (err) {
		console.error("admin-update-review-status error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};
