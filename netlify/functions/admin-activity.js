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

	const secret = process.env.ADMIN_JWT_SECRET;
	if (!secret) return false;

	try {
		jwt.verify(token, secret);
		return true;
	} catch {
		return false;
	}
}

function asString(value) {
	if (value === null || value === undefined) return "";
	return String(value);
}

function normalizeItem(item = {}) {
	const type = asString(item.type).trim();
	const quoteIdString = asString(
		item.quoteIdString || item.quoteId || item.quote?._id || "",
	).trim();
	const reviewIdString = asString(
		item.reviewIdString || item.reviewId || item.review?._id || "",
	).trim();

	const fromStatus = asString(
		item.fromStatus || item.meta?.fromStatus || "",
	).trim();

	const toStatus = asString(
		item.toStatus || item.meta?.toStatus || "",
	).trim();

	const rating =
		Number(
			item.rating ??
				item.ratingSnapshot ??
				item.meta?.rating ??
				item.meta?.ratingSnapshot ??
				0,
		) || 0;

	const clientName = asString(
		item.clientName ||
			item.name ||
			item.quoteName ||
			item.meta?.clientName ||
			"",
	).trim();

	const service = asString(
		item.service || item.serviceType || item.meta?.service || "",
	).trim();

	const source = asString(item.source || item.meta?.source || "").trim();

	const reviewStatus = asString(
		item.reviewStatus || item.meta?.reviewStatus || "",
	).trim();

	const title = asString(item.title).trim();
	const message = asString(item.message).trim();

	return {
		_id: item._id,
		type,
		title,
		message,
		createdAt: item.createdAt || item.updatedAt || item.timestamp || null,
		clientName,
		service,
		source,
		quoteIdString,
		reviewIdString,
		fromStatus,
		toStatus,
		rating,
		reviewStatus,
	};
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "GET") {
			return json(405, {
				ok: false,
				error: "Method Not Allowed",
			});
		}

		if (!isValidBearer(event)) {
			return json(401, {
				ok: false,
				error: "Unauthorized",
			});
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

		return json(200, {
			ok: true,
			items: items.map(normalizeItem),
		});
	} catch (err) {
		console.error("admin-activity error:", err);

		return json(500, {
			ok: false,
			error: "Server error",
		});
	}
};
