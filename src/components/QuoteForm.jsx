import { useRef, useState } from "react";

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 10; // per file
const ALLOWED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"application/pdf",
];

function formatBytes(bytes) {
	const units = ["B", "KB", "MB", "GB"];
	let i = 0;
	let v = bytes;
	while (v >= 1024 && i < units.length - 1) {
		v /= 1024;
		i++;
	}
	return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

const styles = {
	form: {
		display: "grid",
		gap: 12,
		padding: 16,
		border: "1px solid #eee",
		borderRadius: 12,
		background: "white",
	},
	row: { display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" },
	field: { display: "grid", gap: 6 },
	label: { fontSize: 14, fontWeight: 600, color: "#222" },
	input: {
		padding: "10px 12px",
		borderRadius: 10,
		border: "1px solid #ddd",
		outline: "none",
		fontSize: 14,
		background: "white",
		color: "#111",
		caretColor: "#111",
	},

	textarea: {
		padding: "10px 12px",
		borderRadius: 10,
		border: "1px solid #ddd",
		outline: "none",
		fontSize: 14,
		minHeight: 110,
		resize: "vertical",
		background: "white",
		color: "#111",
		caretColor: "#111",
	},
	button: {
		padding: "12px 14px",
		borderRadius: 10,
		border: "none",
		background: "#111",
		color: "white",
		fontWeight: 700,
		cursor: "pointer",
	},
	hint: { fontSize: 13, color: "#666" },
	error: {
		fontSize: 13,
		color: "#b00020",
		background: "#fff5f5",
		border: "1px solid #ffd6d6",
		padding: "10px 12px",
		borderRadius: 10,
	},
	uploadBox: {
		border: "1px dashed #cfcfcf",
		borderRadius: 12,
		padding: 14,
		background: "#fafafa",
		display: "grid",
		gap: 10,
	},
	uploadActions: {
		display: "flex",
		gap: 10,
		flexWrap: "wrap",
		alignItems: "center",
	},
	uploadBtn: {
		padding: "10px 12px",
		borderRadius: 10,
		border: "1px solid #ddd",
		background: "white",
		fontWeight: 700,
		cursor: "pointer",
	},
	fileList: { display: "grid", gap: 8, marginTop: 4 },
	fileRow: {
		display: "grid",
		gridTemplateColumns: "1fr auto",
		gap: 10,
		alignItems: "center",
		padding: "10px 12px",
		border: "1px solid #eee",
		borderRadius: 10,
		background: "white",
	},
	fileMeta: { display: "grid", gap: 2 },
	fileName: { fontSize: 14, fontWeight: 700, color: "#222" },
	fileSub: { fontSize: 12, color: "#666" },
	removeBtn: {
		padding: "8px 10px",
		borderRadius: 10,
		border: "1px solid #ddd",
		background: "white",
		cursor: "pointer",
		fontWeight: 700,
	},
};

async function uploadToCloudinary(file) {
	// 1) Ask your Netlify function for signature + upload params
	const signRes = await fetch("/api/cloudinary-sign", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			contentType: file.type,
		}),
	});

	const signData = await signRes.json().catch(() => ({}));
	if (!signRes.ok || !signData.ok) {
		throw new Error(signData?.error || "Could not sign upload");
	}

	const { cloudName, apiKey, timestamp, folder, signature } = signData;

	// 2) Upload directly to Cloudinary with signed parameters
	const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

	const formData = new FormData();
	formData.append("file", file);
	formData.append("api_key", apiKey);
	formData.append("timestamp", timestamp);
	formData.append("signature", signature);
	formData.append("folder", folder);

	const res = await fetch(endpoint, { method: "POST", body: formData });
	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		console.error("Cloudinary upload error:", data);
		throw new Error(data?.error?.message || "Cloudinary upload failed");
	}

	return data.secure_url;
}

export default function QuoteForm() {
	const [form, setForm] = useState({
		name: "",
		phone: "",
		email: "",
		service: "Painting",
		description: "",
	});

	const [files, setFiles] = useState([]);
	const [error, setError] = useState("");
	const fileInputRef = useRef(null);

	function update(key, value) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	function validateAndFilter(pickedFiles) {
		const errs = [];
		let incoming = pickedFiles;

		const remainingSlots = MAX_FILES - files.length;
		if (incoming.length > remainingSlots) {
			errs.push(`You can upload up to ${MAX_FILES} files total.`);
			incoming = incoming.slice(0, Math.max(0, remainingSlots));
		}

		const valid = [];
		for (const f of incoming) {
			if (!ALLOWED_TYPES.includes(f.type)) {
				errs.push(`"${f.name}" has an unsupported file type.`);
				continue;
			}
			const sizeMB = f.size / (1024 * 1024);
			if (sizeMB > MAX_FILE_SIZE_MB) {
				errs.push(`"${f.name}" is larger than ${MAX_FILE_SIZE_MB}MB.`);
				continue;
			}

			const duplicate = files.some(
				(x) => x.name === f.name && x.size === f.size,
			);
			if (duplicate) {
				errs.push(`"${f.name}" was already added.`);
				continue;
			}

			valid.push(f);
		}

		return { valid, errs };
	}

	function onPickFiles(e) {
		setError("");
		const picked = Array.from(e.target.files || []);
		if (!picked.length) return;

		const { valid, errs } = validateAndFilter(picked);
		if (errs.length) setError(errs.join(" "));
		if (valid.length) setFiles((prev) => [...prev, ...valid]);

		// allow re-selecting the same file later if removed
		e.target.value = "";
	}

	function removeFile(index) {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	}

	function openFilePicker() {
		setError("");
		fileInputRef.current?.click();
	}

	async function onSubmit(e) {
		e.preventDefault();
		setError("");

		try {
			// 1) Upload files to Cloudinary (optional)
			const fileUrls = [];
			for (const file of files) {
				const url = await uploadToCloudinary(file);
				fileUrls.push(url);
			}

			// 2) Send quote + URLs to your Netlify function
			const payload = {
				...form,
				fileUrls, // will be [] if no uploads
				submittedAt: new Date().toISOString(),
			};

			const res = await fetch("/api/quote", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(
					data?.error ||
						"Something went wrong submitting your request.",
				);
				return;
			}

			alert("Quote request sent successfully!");

			// 3) Reset form after alert is closed
			setForm({
				name: "",
				phone: "",
				email: "",
				service: "Painting",
				description: "",
			});
			setFiles([]);
			if (fileInputRef.current) fileInputRef.current.value = "";
		} catch (err) {
			console.error(err);
			setError(err.message || "Upload failed. Please try again.");
		}
	}

	return (
		<form style={styles.form} onSubmit={onSubmit}>
			{error ? <div style={styles.error}>{error}</div> : null}

			<div style={styles.row}>
				<div style={styles.field}>
					<label style={styles.label}>Full Name</label>
					<input
						style={styles.input}
						value={form.name}
						onChange={(e) => update("name", e.target.value)}
						placeholder="Jane Doe"
						required
					/>
				</div>
				<div style={styles.field}>
					<label style={styles.label}>Phone</label>
					<input
						style={styles.input}
						value={form.phone}
						onChange={(e) => update("phone", e.target.value)}
						placeholder="(555) 555-5555"
						required
					/>
				</div>
			</div>

			<div style={styles.row}>
				<div style={styles.field}>
					<label style={styles.label}>Email</label>
					<input
						style={styles.input}
						type="email"
						value={form.email}
						onChange={(e) => update("email", e.target.value)}
						placeholder="you@email.com"
					/>
				</div>
				<div style={styles.field}>
					<label style={styles.label}>Service</label>
					<select
						style={styles.input}
						value={form.service}
						onChange={(e) => update("service", e.target.value)}>
						<option>Painting</option>
						<option>Plaster/Sheetrock Repair</option>
						<option>Trim/Doors/Baseboards</option>
						<option>Floor Refinishing</option>
						<option>Other</option>
					</select>
				</div>
			</div>

			<div style={styles.field}>
				<label style={styles.label}>Project details</label>
				<textarea
					style={styles.textarea}
					value={form.description}
					onChange={(e) => update("description", e.target.value)}
					placeholder="Tell us what you need done, where, and any timelines..."
					required
				/>
				<div style={styles.hint}>
					Tip: Include room count, approximate square footage, and
					desired timeline.
				</div>
			</div>

			<div style={styles.field}>
				<label style={styles.label}>Upload photos / documents</label>

				<div style={styles.uploadBox}>
					<div style={styles.hint}>
						Add up to {MAX_FILES} files. Allowed: JPG, PNG, WEBP,
						PDF. Max {MAX_FILE_SIZE_MB}MB each.
					</div>

					<div style={styles.uploadActions}>
						<button
							type="button"
							style={styles.uploadBtn}
							onClick={openFilePicker}>
							Choose files
						</button>
						<div style={styles.hint}>
							{files.length
								? `${files.length} file(s) selected`
								: "No files selected yet"}
						</div>
					</div>

					<input
						ref={fileInputRef}
						type="file"
						multiple
						accept=".jpg,.jpeg,.png,.webp,.pdf"
						onChange={onPickFiles}
						style={{ display: "none" }}
					/>

					{files.length ? (
						<div style={styles.fileList}>
							{files.map((f, idx) => (
								<div
									key={`${f.name}-${f.size}-${idx}`}
									style={styles.fileRow}>
									<div style={styles.fileMeta}>
										<div style={styles.fileName}>
											{f.name}
										</div>
										<div style={styles.fileSub}>
											{f.type || "file"} •{" "}
											{formatBytes(f.size)}
										</div>
									</div>
									<button
										type="button"
										style={styles.removeBtn}
										onClick={() => removeFile(idx)}>
										Remove
									</button>
								</div>
							))}
						</div>
					) : null}
				</div>
			</div>

			<button style={styles.button} type="submit">
				Request a Quote
			</button>
		</form>
	);
}
