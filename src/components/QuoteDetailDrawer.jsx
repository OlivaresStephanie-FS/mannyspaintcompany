import styles from "./QuoteDetailDrawer.module.css";

function formatDate(v) {
	try {
		return v ? new Date(v).toLocaleString() : "";
	} catch {
		return "";
	}
}

function toThumbUrl(url, w = 220, h = 160) {
	if (!url || typeof url !== "string") return "";
	const needle = "/upload/";
	if (!url.includes(needle)) return url;
	const transform = `c_fill,w_${w},h_${h},q_auto,f_auto/`;
	return url.replace(needle, `${needle}${transform}`);
}

export default function QuoteDetailDrawer({
	quote,
	draftStatus = {},
	savingIds = new Set(),
	statusOptions = [],
	onStatusChange,
	onSaveStatus,
	onClose,
}) {
	if (!quote) return null;

	const uploads = Array.isArray(quote.uploads) ? quote.uploads : [];
	const review = quote.review || {};
	const currentStatus = quote.status || "new";
	const draft = draftStatus[quote._id] || currentStatus;
	const busy = savingIds.has(quote._id);
	const changed = draft !== currentStatus;

	return (
		<>
			<div
				className={styles.backdrop}
				onClick={onClose}
				aria-hidden="true"
			/>

			<aside
				className={styles.drawer}
				role="dialog"
				aria-modal="true"
				aria-label="Quote details">
				<div className={styles.header}>
					<div>
						<h2 className={styles.h2}>Quote Details</h2>
						<p className={styles.sub}>ID: {quote._id}</p>
					</div>

					<button
						type="button"
						className={styles.closeBtn}
						onClick={onClose}>
						Close
					</button>
				</div>

				<div className={styles.section}>
					<div className={styles.label}>Submitted</div>
					<div className={styles.value}>
						{formatDate(quote.submittedAt) || "-"}
					</div>
				</div>

				<div className={styles.grid}>
					<div className={styles.section}>
						<div className={styles.label}>Client Name</div>
						<div className={styles.value}>{quote.name || "-"}</div>
					</div>

					<div className={styles.section}>
						<div className={styles.label}>Phone</div>
						<div className={styles.value}>{quote.phone || "-"}</div>
					</div>

					<div className={styles.section}>
						<div className={styles.label}>Email</div>
						<div className={styles.value}>{quote.email || "-"}</div>
					</div>

					<div className={styles.section}>
						<div className={styles.label}>Service</div>
						<div className={styles.value}>
							{quote.service || "-"}
						</div>
					</div>
				</div>

				<div className={styles.section}>
					<div className={styles.label}>Status</div>

					<div className={styles.statusRow}>
						<select
							className={styles.select}
							value={draft}
							disabled={busy}
							onChange={(e) =>
								onStatusChange?.(quote._id, e.target.value)
							}>
							{statusOptions.map((s) => (
								<option key={s} value={s}>
									{s}
								</option>
							))}
						</select>

						<button
							type="button"
							className={styles.saveBtn}
							disabled={busy || !changed}
							onClick={() => onSaveStatus?.(quote._id)}>
							{busy ? "Saving…" : changed ? "Save" : "Saved"}
						</button>

						<div
							className={`${styles.badge} ${styles[currentStatus]}`}>
							{currentStatus}
						</div>
					</div>
				</div>

				<div className={styles.section}>
					<div className={styles.label}>Project Details</div>
					<div className={styles.textBlock}>
						{quote.description || "-"}
					</div>
				</div>

				<div className={styles.section}>
					<div className={styles.label}>Uploads</div>

					{uploads.length ? (
						<div className={styles.uploadGrid}>
							{uploads.map((u, idx) => {
								const isImage =
									String(
										u.resourceType || "",
									).toLowerCase() === "image";

								return (
									<div
										key={`${quote._id}-${idx}`}
										className={styles.uploadItem}>
										{isImage ? (
											<a
												href={u.url}
												target="_blank"
												rel="noreferrer">
												<img
													src={toThumbUrl(u.url)}
													alt={
														u.originalFilename ||
														"upload"
													}
													className={styles.thumb}
												/>
											</a>
										) : (
											<a
												href={u.url}
												target="_blank"
												rel="noreferrer"
												className={styles.fileLink}>
												{u.originalFilename ||
													"Open file"}
											</a>
										)}
									</div>
								);
							})}
						</div>
					) : (
						<div className={styles.muted}>No uploads attached.</div>
					)}
				</div>

				<div className={styles.section}>
					<h3 className={styles.h3}>Review Workflow</h3>

					<div className={styles.reviewGrid}>
						<div>
							<div className={styles.label}>Review Requested</div>
							<div className={styles.value}>
								{formatDate(review.requestedAt) || "Not sent"}
							</div>
							<div>
								<div className={styles.label}>Rating</div>
								<div className={styles.value}>
									{review.rating ? `${review.rating}/5` : "—"}
								</div>
							</div>
						</div>

						<div>
							<div className={styles.label}>Review Submitted</div>
							<div className={styles.value}>
								{formatDate(review.submittedAt) ||
									"Not submitted"}
							</div>
						</div>

						<div>
							<div className={styles.label}>Review ID</div>
							<div className={styles.value}>
								{review.reviewId || "-"}
							</div>
						</div>

						<div>
							<div className={styles.label}>Completed At</div>
							<div className={styles.value}>
								{formatDate(quote.completedAt) || "-"}
							</div>
						</div>
					</div>
				</div>
			</aside>
		</>
	);
}
