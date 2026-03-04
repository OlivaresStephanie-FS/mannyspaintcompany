import { getDb } from "./_db.js";
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

	// ✅ JWT-only
	const secret = process.env.ADMIN_JWT_SECRET;
	if (!secret) return false;

	try {
		jwt.verify(token, secret);
		return true;
	} catch {
		return false;
	}
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
