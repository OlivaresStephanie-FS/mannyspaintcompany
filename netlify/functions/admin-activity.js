import { getDb } from "./_db.js";
import jwt from "jsonwebtoken";

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

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "GET") {
			return {
				statusCode: 405,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
				},
				body: JSON.stringify({
					ok: false,
					error: "Method Not Allowed",
				}),
			};
		}

		if (!isValidBearer(event)) {
			return {
				statusCode: 401,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
				},
				body: JSON.stringify({
					ok: false,
					error: "Unauthorized",
				}),
			};
		}

		const db = await getDb();
		const limitRaw = Number(event.queryStringParameters?.limit || 25);
		const limit = Math.max(1, Math.min(100, limitRaw));

		const items = await db
			.collection("activity")
			.find({})
			.sort({ createdAt: -1, _id: -1 })
			.limit(limit)
			.toArray();

		return {
			statusCode: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store",
			},
			body: JSON.stringify({
				ok: true,
				items,
			}),
		};
	} catch (err) {
		console.error("admin-activity error:", err);

		return {
			statusCode: 500,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store",
			},
			body: JSON.stringify({
				ok: false,
				error: "Server error",
			}),
		};
	}
};
