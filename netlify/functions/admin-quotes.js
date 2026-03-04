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

function requireJwt(event) {
	const auth =
		event.headers?.authorization || event.headers?.Authorization || "";

	if (!auth.startsWith("Bearer ")) return null;

	const token = auth.slice(7).trim();
	if (!token) return null;

	const secret = process.env.ADMIN_JWT_SECRET;
	if (!secret) return null;

	try {
		// returns payload if valid
		return jwt.verify(token, secret);
	} catch {
		return null;
	}
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "GET") {
			return json(405, { ok: false, error: "Method Not Allowed" });
		}

		const payload = requireJwt(event);
		if (!payload) return json(401, { ok: false, error: "Unauthorized" });

		const db = await getDb();

		const page = Math.max(
			1,
			Number(event.queryStringParameters?.page || 1),
		);
		const limit = Math.min(
			50,
			Math.max(1, Number(event.queryStringParameters?.limit || 20)),
		);
		const skip = (page - 1) * limit;

		const [items, total] = await Promise.all([
			db
				.collection("quotes")
				.find({})
				.sort({ submittedAt: -1, _id: -1 })
				.skip(skip)
				.limit(limit)
				.toArray(),
			db.collection("quotes").countDocuments(),
		]);

		return json(200, { ok: true, page, limit, total, items });
	} catch (err) {
		console.error("admin-quotes error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};
