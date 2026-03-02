import { ObjectId } from "mongodb";
import { getDb } from "./_db.js";

function json(statusCode, body) {
	return {
		statusCode,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=60",
		},
		body: JSON.stringify(body),
	};
}

function isValidBearer(event) {
	const expected = process.env.ADMIN_TOKEN;
	const auth =
		event.headers?.authorization || event.headers?.Authorization || "";
	if (!expected) return false;
	if (!auth.startsWith("Bearer ")) return false;
	return auth.slice("Bearer ".length).trim() === expected;
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "PATCH") {
			return json(405, { ok: false, error: "Method Not Allowed" });
		}

		if (!isValidBearer(event)) {
			return json(401, { ok: false, error: "Unauthorized" });
		}

		const body = JSON.parse(event.body || "{}");
		const reviewId = body.reviewId;
		const nextStatus = String(body.status || "").trim(); // pending | approved | rejected

		if (!reviewId)
			return json(400, { ok: false, error: "Missing reviewId" });
		if (!["pending", "approved", "rejected"].includes(nextStatus)) {
			return json(400, { ok: false, error: "Invalid status" });
		}

		const db = await getDb();
		const col = db.collection("reviews");

		const update = {
			$set: {
				status: nextStatus,
				updatedAt: new Date(),
				approvedAt: nextStatus === "approved" ? new Date() : null,
			},
		};

		const result = await col.updateOne(
			{ _id: new ObjectId(reviewId) },
			update,
		);

		if (result.matchedCount === 0) {
			return json(404, { ok: false, error: "Review not found" });
		}

		return json(200, { ok: true });
	} catch (err) {
		console.error("admin-update-review-status error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};
