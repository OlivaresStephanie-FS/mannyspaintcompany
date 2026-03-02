import { getDb } from "./_db.js";

function unauthorized() {
	return {
		statusCode: 401,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ok: false, error: "Unauthorized" }),
	};
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "GET") {
			return {
				statusCode: 405,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					ok: false,
					error: "Method Not Allowed",
				}),
			};
		}

		const auth =
			event.headers?.authorization || event.headers?.Authorization || "";
		const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

		if (!process.env.ADMIN_TOKEN) {
			return {
				statusCode: 500,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					ok: false,
					error: "Missing ADMIN_TOKEN env var",
				}),
			};
		}

		if (!token || token !== process.env.ADMIN_TOKEN) return unauthorized();

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

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				ok: true,
				page,
				limit,
				total,
				items,
			}),
		};
	} catch (err) {
		console.error("admin-quotes error:", err);
		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				ok: false,
				error: err.message || "Server error",
			}),
		};
	}
};

