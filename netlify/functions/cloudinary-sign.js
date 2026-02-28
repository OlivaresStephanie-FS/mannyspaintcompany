import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"application/pdf",
];

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "POST") {
			return {
				statusCode: 405,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					ok: false,
					error: "Method Not Allowed",
				}),
			};
		}

		// Ensure env exists
		if (
			!process.env.CLOUDINARY_CLOUD_NAME ||
			!process.env.CLOUDINARY_API_KEY ||
			!process.env.CLOUDINARY_API_SECRET
		) {
			return {
				statusCode: 500,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					ok: false,
					error: "Missing Cloudinary server env vars",
				}),
			};
		}

		const body = JSON.parse(event.body || "{}");
		const { contentType } = body;

		if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					ok: false,
					error: "Unsupported or missing contentType",
				}),
			};
		}

		const timestamp = Math.floor(Date.now() / 1000);
		const folder =
			process.env.CLOUDINARY_FOLDER || "mannyspaintcompany/quotes";

		// Sign these parameters
		const paramsToSign = { timestamp, folder };

		const signature = cloudinary.utils.api_sign_request(
			paramsToSign,
			process.env.CLOUDINARY_API_SECRET,
		);

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				ok: true,
				cloudName: process.env.CLOUDINARY_CLOUD_NAME,
				apiKey: process.env.CLOUDINARY_API_KEY,
				timestamp,
				folder,
				signature,
			}),
		};
	} catch (err) {
		console.error("cloudinary-sign error:", err);
		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ok: false, error: "Server error" }),
		};
	}
};
