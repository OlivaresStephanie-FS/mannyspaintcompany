import { getDb } from "./_db.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

function quoteHasReviewId(quote) {
	const reviewId = quote?.review?.reviewId;
	if (reviewId === null || reviewId === undefined) return false;
	return String(reviewId).trim() !== "";
}

const ALLOWED_RESOURCE_TYPES = new Set(["image", "raw", "video"]);

function quoteUploadFolder() {
	return String(process.env.CLOUDINARY_FOLDER || "mannyspaintcompany/quotes")
		.trim()
		.replace(/^\/+|\/+$/g, "");
}

function unverifiedAttachment(message) {
	const error = new Error(message);
	error.code = "UNVERIFIED_ATTACHMENT";
	return error;
}

function isQuoteFolderPublicId(publicId, folder) {
	const id = String(publicId || "").trim();
	if (!folder || !id) return false;
	if (id.startsWith("/") || id.includes("\\") || id.includes("..")) {
		return false;
	}

	const prefix = `${folder}/`;
	if (!id.startsWith(prefix)) return false;

	const remainder = id.slice(prefix.length);
	return remainder.length > 0 && !remainder.includes("..");
}

async function deleteUploads(uploads) {
	const files = Array.isArray(uploads) ? uploads : [];
	const attached = files.filter(
		(file) =>
			String(file?.publicId || "").trim() ||
			String(file?.url || "").trim(),
	);

	if (!attached.length) return;

	const folder = quoteUploadFolder();
	if (!folder) {
		throw unverifiedAttachment("Quote upload folder is not configured");
	}

	const verified = attached.map((file) => {
		const publicId = String(file?.publicId || "").trim();
		const resourceType = String(file?.resourceType || "")
			.trim()
			.toLowerCase();

		if (
			!publicId ||
			!resourceType ||
			!ALLOWED_RESOURCE_TYPES.has(resourceType) ||
			!isQuoteFolderPublicId(publicId, folder)
		) {
			throw unverifiedAttachment(
				"Quote attachment is outside the quotes folder",
			);
		}

		return { publicId, resourceType };
	});

	if (
		!process.env.CLOUDINARY_CLOUD_NAME ||
		!process.env.CLOUDINARY_API_KEY ||
		!process.env.CLOUDINARY_API_SECRET
	) {
		throw new Error("Cloudinary is not configured");
	}

	for (const file of verified) {
		const result = await cloudinary.uploader.destroy(file.publicId, {
			resource_type: file.resourceType,
			invalidate: true,
		});

		const outcome = String(result?.result || "");
		if (outcome !== "ok" && outcome !== "not found") {
			throw new Error(outcome || "Cloudinary deletion failed");
		}
	}
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "DELETE") {
			return json(405, { ok: false, error: "Method Not Allowed" });
		}

		if (!isValidBearer(event)) {
			return json(401, { ok: false, error: "Unauthorized" });
		}

		let body = {};
		try {
			body = JSON.parse(event.body || "{}");
		} catch {
			return json(400, { ok: false, error: "Invalid request body" });
		}

		const quoteId = String(body.quoteId || "").trim();
		if (!quoteId || quoteId.length !== 24 || !ObjectId.isValid(quoteId)) {
			return json(400, { ok: false, error: "Invalid quoteId format" });
		}

		const db = await getDb();
		const _id = new ObjectId(quoteId);
		const quotes = db.collection("quotes");
		const reviews = db.collection("reviews");
		const activity = db.collection("activity");

		const current = await quotes.findOne({ _id });
		if (!current) {
			return json(404, { ok: false, error: "Quote not found" });
		}

		const linkedReview = await reviews.findOne({
			$or: [{ quoteId: _id }, { quoteId }],
		});

		if (quoteHasReviewId(current) || linkedReview) {
			return json(409, {
				ok: false,
				error: "This quote has an associated review and cannot be deleted.",
			});
		}

		try {
			await deleteUploads(current.uploads);
		} catch (err) {
			console.error("admin-delete-quote attachments:", err);
			const unverified = err?.code === "UNVERIFIED_ATTACHMENT";
			return json(500, {
				ok: false,
				error: unverified
					? "A quote attachment could not be verified. The quote was not removed."
					: "Could not delete quote attachments. The quote was not removed.",
			});
		}

		const deleted = await quotes.deleteOne({ _id });
		if (deleted.deletedCount !== 1) {
			return json(500, {
				ok: false,
				error: "Could not delete quote.",
			});
		}

		try {
			const activityResult = await activity.deleteMany({
				$or: [{ quoteId: _id }, { quoteIdString: quoteId }],
			});

			return json(200, {
				ok: true,
				quoteId,
				deletedActivity: activityResult.deletedCount || 0,
			});
		} catch (err) {
			console.error("admin-delete-quote activity:", err);
			return json(500, {
				ok: false,
				quoteDeleted: true,
				error: "Quote was deleted, but its activity records could not be removed.",
			});
		}
	} catch (err) {
		console.error("admin-delete-quote error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};
