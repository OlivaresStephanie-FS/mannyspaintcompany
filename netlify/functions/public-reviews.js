// netlify/functions/public-reviews.js
import { getDb } from "./_db.js";

function json(statusCode, body) {
	return {
		statusCode,
		headers: {
			"Content-Type": "application/json",
			// public endpoint: allow caching a bit
			"Cache-Control": "public, max-age=60",
		},
		body: JSON.stringify(body),
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

		// only approved reviews should be public
		const items = await db
			.collection("reviews")
			.find({ status: "approved" })
			.sort({ submittedAt: -1, _id: -1 })
			.limit(limit)
			.toArray();

		return json(200, { ok: true, items });
	} catch (err) {
		console.error("public-reviews error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};
