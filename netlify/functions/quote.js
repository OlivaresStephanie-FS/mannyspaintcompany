import { getDb } from "./_db.js";
import nodemailer from "nodemailer";

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

function createTransporter() {
	const host = process.env.SMTP_HOST;
	const port = Number(process.env.SMTP_PORT || 465);
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;

	if (!host || !user || !pass) return null;

	return nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: { user, pass },
	});
}

function asArrayEmails(v) {
	if (!v) return [];
	if (Array.isArray(v)) return v;
	return String(v)
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

function buildClientConfirmHtml(payload, cleanedUploads) {
	const uploadsList = cleanedUploads?.length
		? `<ul style="padding-left:18px;">
        ${cleanedUploads
			.map(
				(u) =>
					`<li><a href="${u.url}" target="_blank" rel="noreferrer">View attachment</a></li>`,
			)
			.join("")}
      </ul>`
		: `<p style="margin:0;">No files were attached.</p>`;

	return `
  <div style="font-family:Arial,sans-serif;line-height:1.4;color:#111;">
    <h2 style="margin:0 0 10px;">We received your quote request ✅</h2>
    <p style="margin:0 0 12px;">
      Hi ${payload?.name || "there"},<br/>
      Thanks for reaching out to Manny’s Painting Company. We’ve received your request and will follow up shortly.
    </p>

    <div style="padding:12px;border:1px solid #eee;border-radius:10px;background:#fafafa;">
      <p style="margin:0 0 8px;"><b>Service:</b> ${payload?.service || ""}</p>
      <p style="margin:0 0 8px;"><b>Phone:</b> ${payload?.phone || ""}</p>
      ${payload?.email ? `<p style="margin:0 0 8px;"><b>Email:</b> ${payload.email}</p>` : ""}
      <p style="margin:0;"><b>Details:</b><br/>${(payload?.description || "").replace(/\n/g, "<br/>")}</p>
    </div>

    <h3 style="margin:16px 0 8px;">Attachments</h3>
    ${uploadsList}

    <p style="margin:16px 0 0;color:#555;font-size:13px;">
      If you need to add more details, just reply to this email.
    </p>
  </div>
  `;
}

function thumb(url, w = 220, h = 160) {
	if (!url || typeof url !== "string") return "";
	const needle = "/upload/";
	if (!url.includes(needle)) return url;
	const transform = `c_fill,w_${w},h_${h},q_auto,f_auto/`;
	return url.replace(needle, `${needle}${transform}`);
}

function escapeHtml(s = "") {
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function buildActivityDoc({
	now,
	quoteId,
	name,
	email,
	service,
	status = "new",
	source = "website",
}) {
	return {
		type: "quote_submitted",
		title: "Quote submitted",
		message: "New quote request submitted from website",
		source,
		createdAt: now,
		quoteId,
		quoteIdString: String(quoteId),
		clientName: name || "",
		clientEmail: email || "",
		service: service || "",
		toStatus: status,
	};
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "POST") {
			return json(200, {
				ok: true,
				message: "quote endpoint reachable (use POST)",
			});
		}

		const payload = JSON.parse(event.body || "{}");

		const required = ["name", "phone", "service", "description"];
		for (const key of required) {
			if (!payload[key] || String(payload[key]).trim() === "") {
				return json(400, {
					ok: false,
					error: `Missing field: ${key}`,
				});
			}
		}

		const db = await getDb();
		const quotes = db.collection("quotes");
		const activity = db.collection("activity");

		const uploads = Array.isArray(payload.uploads) ? payload.uploads : [];

		const cleanedUploads = uploads
			.map((u) => ({
				url: u?.url || "",
				publicId: u?.publicId || "",
				resourceType: u?.resourceType || "",
				bytes: Number(u?.bytes || 0),
				format: u?.format || "",
				originalFilename: u?.originalFilename || "",
				width: Number(u?.width || 0),
				height: Number(u?.height || 0),
			}))
			.filter((u) => u.url);

		const now = new Date();

		const doc = {
			name: payload.name,
			phone: payload.phone,
			email: payload.email || "",
			service: payload.service,
			description: payload.description,
			uploads: cleanedUploads,
			submittedAt: payload.submittedAt
				? new Date(payload.submittedAt)
				: now,
			status: "new",
			statusUpdatedAt: now,
			completedAt: null,
			review: {
				requestedAt: null,
				tokenHash: null,
				tokenExpiresAt: null,
				submittedAt: null,
				reviewId: null,
				status: null,
				moderatedAt: null,
				rating: null,
			},
			source: "website",
		};

		const result = await quotes.insertOne(doc);
		const quoteId = result.insertedId.toString();

		console.log("✅ Saved to MongoDB:", quoteId);

		await activity.insertOne(
			buildActivityDoc({
				now,
				quoteId: result.insertedId,
				name: doc.name,
				email: doc.email,
				service: doc.service,
				status: "new",
				source: "website",
			}),
		);

		const {
			SMTP_USER,
			ADMIN_NOTIFY_EMAILS,
			NOTIFY_EMAIL_FROM_NAME,
			CLIENT_CONFIRM_ENABLED,
			CLIENT_CONFIRM_SUBJECT,
		} = process.env;

		const transporter = createTransporter();

		if (transporter && ADMIN_NOTIFY_EMAILS) {
			const toList = asArrayEmails(ADMIN_NOTIFY_EMAILS);

			const uploadHtml = cleanedUploads.length
				? cleanedUploads
						.map((u) => {
							const isImg =
								u.resourceType === "image" ||
								/\.(jpg|jpeg|png|webp)$/i.test(u.url);

							const preview = isImg
								? `<a href="${u.url}" target="_blank" rel="noreferrer">
								<img src="${thumb(u.url)}" alt="upload" style="width:220px;height:160px;object-fit:cover;border-radius:10px;border:1px solid #e5e5e5" />
						   </a>`
								: `<a href="${u.url}" target="_blank" rel="noreferrer">${escapeHtml(
										u.originalFilename || "View file",
									)}</a>`;

							return `<div style="margin:10px 0;">${preview}</div>`;
						})
						.join("")
				: `<div style="color:#666;">No uploads</div>`;

			const adminHtml = `
		<div style="font-family: Arial, sans-serif; line-height: 1.4;">
			<h2 style="margin:0 0 10px;">New Quote Request</h2>
			<div style="color:#666;margin-bottom:12px;">Quote ID: ${quoteId}</div>

			<table style="border-collapse:collapse;">
				<tr><td style="padding:6px 10px;font-weight:700;">Name</td><td style="padding:6px 10px;">${escapeHtml(doc.name)}</td></tr>
				<tr><td style="padding:6px 10px;font-weight:700;">Phone</td><td style="padding:6px 10px;">${escapeHtml(doc.phone)}</td></tr>
				<tr><td style="padding:6px 10px;font-weight:700;">Email</td><td style="padding:6px 10px;">${escapeHtml(doc.email)}</td></tr>
				<tr><td style="padding:6px 10px;font-weight:700;">Service</td><td style="padding:6px 10px;">${escapeHtml(doc.service)}</td></tr>
				<tr><td style="padding:6px 10px;font-weight:700;vertical-align:top;">Details</td><td style="padding:6px 10px;white-space:pre-wrap;">${escapeHtml(doc.description)}</td></tr>
			</table>

			<h3 style="margin:18px 0 8px;">Uploads</h3>
			${uploadHtml}
		</div>
	`;

			await transporter.sendMail({
				from: `"${NOTIFY_EMAIL_FROM_NAME || "Quotes"}" <${SMTP_USER}>`,
				to: toList,
				replyTo: doc.email || SMTP_USER,
				subject: `New Quote Request — ${doc.service} (${doc.name})`,
				html: adminHtml,
			});

			console.log("📧 Admin email sent to:", toList.join(", "));

			const clientEmail = String(doc.email || "").trim();
			const clientEnabled =
				String(CLIENT_CONFIRM_ENABLED || "true") === "true";

			if (clientEnabled && clientEmail) {
				await transporter.sendMail({
					from: `"${NOTIFY_EMAIL_FROM_NAME || "Quotes"}" <${SMTP_USER}>`,
					to: clientEmail,
					replyTo: SMTP_USER,
					subject:
						CLIENT_CONFIRM_SUBJECT ||
						"We received your quote request ✅",
					html: buildClientConfirmHtml(doc, cleanedUploads),
				});

				console.log("📧 Client confirmation sent to:", clientEmail);
			} else {
				console.log(
					"ℹ️ Client confirmation skipped (no email provided or disabled).",
				);
			}
		} else {
			console.log(
				"📧 Email skipped: missing SMTP or ADMIN_NOTIFY_EMAILS env vars",
			);
		}

		return json(200, { ok: true, quoteId });
	} catch (err) {
		console.error("❌ quote error:", err);
		return json(500, {
			ok: false,
			error: err.message || "Server error",
		});
	}
};
