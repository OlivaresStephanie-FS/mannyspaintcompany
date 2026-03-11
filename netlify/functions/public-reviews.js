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

function normalizeReview(doc = {}) {
	return {
		_id: doc._id,
		name: doc.name || "",
		rating: Number(doc.rating) || 0,
		text: doc.text || doc.message || "",
		serviceType: doc.serviceType || "",
		createdAt: doc.createdAt || doc.submittedAt || null,
		submittedAt: doc.submittedAt || doc.createdAt || null,
	};
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "GET") {
			return json(405, { ok: false, error: "Method Not Allowed" });
		}

		const qs = event.queryStringParameters || {};
		const limit = Math.min(50, Math.max(1, Number(qs.limit || 6)));

		const db = await getDb();

		const items = await db
			.collection("reviews")
			.find({ status: "approved" })
			.sort({ submittedAt: -1, createdAt: -1, _id: -1 })
			.limit(limit)
			.toArray();

		return json(200, {
			ok: true,
			items: items.map(normalizeReview),
		});
	} catch (err) {
		console.error("public-reviews error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};