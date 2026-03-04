import { useRef, useState } from "react";
import styles from "./QuoteForm.module.css";

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

async function uploadToCloudinary(file) {
	const signRes = await fetch("/api/cloudinary-sign", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ contentType: file.type }),
	});

	const signData = await signRes.json().catch(() => ({}));
	if (!signRes.ok || !signData.ok) {
		throw new Error(signData?.error || "Could not sign upload");
	}

	const { cloudName, apiKey, timestamp, folder, signature } = signData;

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

	const publicId = data.public_id;
	const version = data.version;
	const resourceType = data.resource_type;

	const thumbTransforms =
		file.type === "application/pdf"
			? "f_jpg,pg_1,w_420,h_420,c_fill,q_auto"
			: "w_420,h_420,c_fill,q_auto,f_auto";

	const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${thumbTransforms}/v${version}/${publicId}.jpg`;

	return {
		url: data.secure_url,
		publicId,
		resourceType,
		bytes: data.bytes,
		format: data.format || "",
		originalFilename: data.original_filename || file.name,
		version,
		thumbUrl,
		width: data.width || 0,
		height: data.height || 0,
	};
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
			const uploads = [];
			for (const file of files) {
				const uploaded = await uploadToCloudinary(file);
				uploads.push(uploaded);
			}

			const payload = {
				...form,
				uploads,
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
		<form className={styles.form} onSubmit={onSubmit}>
			{error ? <div className={styles.error}>{error}</div> : null}

			<div className={styles.row}>
				<div className={styles.field}>
					<label className={styles.label}>Full Name</label>
					<input
						className={styles.input}
						value={form.name}
						onChange={(e) => update("name", e.target.value)}
						placeholder="Jane Doe"
						required
					/>
				</div>

				<div className={styles.field}>
					<label className={styles.label}>Phone</label>
					<input
						className={styles.input}
						value={form.phone}
						onChange={(e) => update("phone", e.target.value)}
						placeholder="(555) 555-5555"
						required
					/>
				</div>
			</div>

			<div className={styles.row}>
				<div className={styles.field}>
					<label className={styles.label}>Email</label>
					<input
						className={styles.input}
						type="email"
						value={form.email}
						onChange={(e) => update("email", e.target.value)}
						placeholder="you@email.com"
					/>
				</div>

				<div className={styles.field}>
					<label className={styles.label}>Service</label>
					<select
						className={styles.select}
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

			<div className={styles.field}>
				<label className={styles.label}>Project details</label>
				<textarea
					className={styles.textarea}
					value={form.description}
					onChange={(e) => update("description", e.target.value)}
					placeholder="Tell us what you need done, where, and any timelines..."
					required
				/>
				<div className={styles.hint}>
					Tip: Include room count, approximate square footage, and
					desired timeline.
				</div>
			</div>

			<div className={styles.field}>
				<label className={styles.label}>
					Upload photos / documents
				</label>

				<div className={styles.uploadBox}>
					<div className={styles.hint}>
						Add up to {MAX_FILES} files. Allowed: JPG, PNG, WEBP,
						PDF. Max {MAX_FILE_SIZE_MB}MB each.
					</div>

					<div className={styles.uploadActions}>
						<button
							type="button"
							className={styles.uploadBtn}
							onClick={openFilePicker}>
							Choose files
						</button>

						<div className={styles.hint}>
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
						className={styles.hiddenInput}
					/>

					{files.length ? (
						<div className={styles.fileList}>
							{files.map((f, idx) => (
								<div
									key={`${f.name}-${f.size}-${idx}`}
									className={styles.fileRow}>
									<div className={styles.fileMeta}>
										<div className={styles.fileName}>
											{f.name}
										</div>
										<div className={styles.fileSub}>
											{f.type || "file"} •{" "}
											{formatBytes(f.size)}
										</div>
									</div>

									<button
										type="button"
										className={styles.removeBtn}
										onClick={() => removeFile(idx)}>
										Remove
									</button>
								</div>
							))}
						</div>
					) : null}
				</div>
			</div>

			<button className={styles.button} type="submit">
				Request a Quote
			</button>
		</form>
	);
}
