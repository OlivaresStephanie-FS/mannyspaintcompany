import { getDb } from "./_db.js";

function json(statusCode, body) {
	return {
		statusCode,
		headers: { "Content-Type": "application/json" },
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
		if (event.httpMethod !== "GET") {
			return json(405, { ok: false, error: "Method Not Allowed" });
		}
		if (!isValidBearer(event)) {
			return json(401, { ok: false, error: "Unauthorized" });
		}

		const qs = event.queryStringParameters || {};
		const status = String(qs.status || "pending").trim(); // pending | approved | rejected | all
		const page = Math.max(1, Number(qs.page || 1));
		const limit = Math.min(50, Math.max(1, Number(qs.limit || 10)));
		const skip = (page - 1) * limit;

		const db = await getDb();

		const filter = status === "all" ? {} : { status: status };

		const total = await db.collection("reviews").countDocuments(filter);

		const items = await db
			.collection("reviews")
			.find(filter)
			.sort({ submittedAt: -1 })
			.skip(skip)
			.limit(limit)
			.toArray();

		return json(200, {
			ok: true,
			page,
			limit,
			total,
			items,
		});
	} catch (err) {
		console.error("admin-reviews error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};
