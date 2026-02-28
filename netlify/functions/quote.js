import { getDb } from "./_db.js";

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "POST") {
			return {
				statusCode: 200,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					ok: true,
					message: "quote endpoint reachable (use POST)",
				}),
			};
		}

		const payload = JSON.parse(event.body || "{}");

		// Basic validation
		const required = ["name", "phone", "service", "description"];
		for (const key of required) {
			if (!payload[key] || String(payload[key]).trim() === "") {
				return {
					statusCode: 400,
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						ok: false,
						error: `Missing field: ${key}`,
					}),
				};
			}
		}

		const db = await getDb();

		const doc = {
			name: payload.name,
			phone: payload.phone,
			email: payload.email || "",
			service: payload.service,
			description: payload.description,
			fileUrls: Array.isArray(payload.fileUrls) ? payload.fileUrls : [],
			submittedAt: payload.submittedAt
				? new Date(payload.submittedAt)
				: new Date(),
			status: "new",
			source: "website",
		};

		const result = await db.collection("quotes").insertOne(doc);

		console.log("✅ Saved to MongoDB:", result.insertedId.toString());

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				ok: true,
				quoteId: result.insertedId.toString(),
			}),
		};
	} catch (err) {
		console.error("❌ MongoDB error:", err);
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
