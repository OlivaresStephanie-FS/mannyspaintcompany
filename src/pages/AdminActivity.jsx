import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, clearToken } from "../lib/adminAuth";
import AdminNav from "../components/AdminNav";
import styles from "./AdminActivity.module.css";

function formatDate(v) {
	try {
		return v ? new Date(v).toLocaleString() : "";
	} catch {
		return "";
	}
}

const TYPE_LABELS = {
	quote_submitted: "Quote Submitted",
	quote_status_changed: "Status Changed",
	quote_completed: "Quote Completed",
	review_requested: "Review Requested",
	review_submitted: "Review Submitted",
	review_approved: "Review Approved",
	review_rejected: "Review Rejected",
};

function getTypeLabel(type) {
	return TYPE_LABELS[type] || "Activity";
}

function getItemTitle(item) {
	if (item.title) return item.title;

	switch (item.type) {
		case "quote_status_changed":
			if (item.fromStatus && item.toStatus) {
				return `Quote moved from ${item.fromStatus} to ${item.toStatus}`;
			}
			if (item.toStatus) {
				return `Quote moved to ${item.toStatus}`;
			}
			return "Quote status updated";

		case "quote_completed":
			return "Quote marked completed";

		case "review_requested":
			return "Review request sent";

		case "review_submitted":
			return "Review submitted";

		case "review_approved":
			return "Review approved";

		case "review_rejected":
			return "Review rejected";

		case "quote_submitted":
			return "New quote submitted";

		default:
			return getTypeLabel(item.type);
	}
}

function getItemMessage(item) {
	if (item.message) return item.message;

	switch (item.type) {
		case "quote_submitted":
			return "A new quote was submitted through the public form.";
		case "quote_status_changed":
			if (item.fromStatus && item.toStatus) {
				return `Status changed from ${item.fromStatus} to ${item.toStatus}.`;
			}
			if (item.toStatus) {
				return `Status changed to ${item.toStatus}.`;
			}
			return "Quote status was updated.";
		case "quote_completed":
			return "This quote was marked as completed.";
		case "review_requested":
			return "A review request email was sent to the client.";
		case "review_submitted":
			return "A customer submitted a review.";
		case "review_approved":
			return "A review was approved and made public.";
		case "review_rejected":
			return "A review was rejected and kept off the public page.";
		default:
			return "";
	}
}

function hasMeta(item) {
	return Boolean(
		item.clientName ||
		item.service ||
		item.quoteIdString ||
		item.source ||
		item.rating ||
		item.reviewIdString ||
		item.fromStatus ||
		item.toStatus ||
		item.reviewStatus,
	);
}

export default function AdminActivity() {
	const navigate = useNavigate();

	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const t = String(getToken() || "").trim();
		if (!t) navigate("/admin/login");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function load() {
		setLoading(true);
		setError("");

		try {
			const t = String(getToken() || "").trim();

			if (!t) {
				clearToken();
				navigate("/admin/login");
				return;
			}

			const res = await fetch(
				"/.netlify/functions/admin-activity?limit=50",
				{
					headers: { Authorization: `Bearer ${t}` },
				},
			);

			if (res.status === 401) {
				clearToken();
				navigate("/admin/login");
				return;
			}

			const data = await res.json().catch(() => ({}));
			if (!res.ok || !data.ok) {
				throw new Error(data?.error || "Failed to load activity");
			}

			setItems(Array.isArray(data.items) ? data.items : []);
		} catch (e) {
			setItems([]);
			setError(e?.message || "Error loading activity");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className={styles.page}>
			<AdminNav />

			<div className={styles.headerRow}>
				<div>
					<h1 className={styles.h1}>Activity</h1>
					<p className={styles.subhead}>
						Recent quote and review events across the system.
					</p>
				</div>

				<button
					type="button"
					className={styles.refreshBtn}
					onClick={load}
					disabled={loading}>
					{loading ? "Loading..." : "Refresh"}
				</button>
			</div>

			{error ? <div className={styles.err}>{error}</div> : null}

			<div className={styles.panel}>
				{loading ? (
					<div className={styles.empty}>Loading activity…</div>
				) : items.length ? (
					<div className={styles.list}>
						{items.map((item) => {
							const type = String(item.type || "");
							const label = getTypeLabel(type);
							const title = getItemTitle(item);
							const message = getItemMessage(item);

							return (
								<div key={item._id} className={styles.item}>
									<div className={styles.itemTop}>
										<span
											className={`${styles.badge} ${
												styles[type] || ""
											}`}>
											{label}
										</span>

										<span className={styles.date}>
											{formatDate(item.createdAt) || "—"}
										</span>
									</div>

									<div className={styles.title}>{title}</div>

									{message ? (
										<div className={styles.message}>
											{message}
										</div>
									) : null}

									{hasMeta(item) ? (
										<div className={styles.metaGrid}>
											{item.clientName ? (
												<div>
													<span
														className={
															styles.metaLabel
														}>
														Client
													</span>
													<span
														className={
															styles.metaValue
														}>
														{item.clientName}
													</span>
												</div>
											) : null}

											{item.service ? (
												<div>
													<span
														className={
															styles.metaLabel
														}>
														Service
													</span>
													<span
														className={
															styles.metaValue
														}>
														{item.service}
													</span>
												</div>
											) : null}

											{item.quoteIdString ? (
												<div>
													<span
														className={
															styles.metaLabel
														}>
														Quote ID
													</span>
													<button
														type="button"
														className={
															styles.linkBtn
														}
														onClick={() =>
															navigate(
																`/admin?quote=${encodeURIComponent(
																	item.quoteIdString,
																)}`,
															)
														}>
														{item.quoteIdString}
													</button>
												</div>
											) : null}

											{item.reviewIdString ? (
												<div>
													<span
														className={
															styles.metaLabel
														}>
														Review ID
													</span>
													<span
														className={
															styles.metaValueBreak
														}>
														{item.reviewIdString}
													</span>
												</div>
											) : null}

											{item.fromStatus ? (
												<div>
													<span
														className={
															styles.metaLabel
														}>
														From Status
													</span>
													<span
														className={
															styles.metaValue
														}>
														{item.fromStatus}
													</span>
												</div>
											) : null}

											{item.toStatus ? (
												<div>
													<span
														className={
															styles.metaLabel
														}>
														To Status
													</span>
													<span
														className={
															styles.metaValue
														}>
														{item.toStatus}
													</span>
												</div>
											) : null}

											{item.reviewStatus ? (
												<div>
													<span
														className={
															styles.metaLabel
														}>
														Review Status
													</span>
													<span
														className={
															styles.metaValue
														}>
														{item.reviewStatus}
													</span>
												</div>
											) : null}

											{item.rating ? (
												<div>
													<span
														className={
															styles.metaLabel
														}>
														Rating
													</span>
													<span
														className={
															styles.metaValue
														}>
														{item.rating}/5
													</span>
												</div>
											) : null}

											{item.source ? (
												<div>
													<span
														className={
															styles.metaLabel
														}>
														Source
													</span>
													<span
														className={
															styles.metaValue
														}>
														{item.source}
													</span>
												</div>
											) : null}
										</div>
									) : null}
								</div>
							);
						})}
					</div>
				) : (
					<div className={styles.empty}>No activity found.</div>
				)}
			</div>
		</div>
	);
}
