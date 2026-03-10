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
				{items.length ? (
					<div className={styles.list}>
						{items.map((item) => {
							const type = String(item.type || "");
							const label = TYPE_LABELS[type] || "Activity";

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
											{formatDate(item.createdAt)}
										</span>
									</div>

									<div className={styles.title}>
										{item.title || label}
									</div>

									{item.message ? (
										<div className={styles.message}>
											{item.message}
										</div>
									) : null}

									<div className={styles.metaGrid}>
										<div>
											<span className={styles.metaLabel}>
												Client
											</span>
											<span className={styles.metaValue}>
												{item.clientName || "-"}
											</span>
										</div>

										<div>
											<span className={styles.metaLabel}>
												Service
											</span>
											<span className={styles.metaValue}>
												{item.service || "-"}
											</span>
										</div>

										<div>
											<span className={styles.metaLabel}>
												Quote ID
											</span>
											<span
												className={
													styles.metaValueBreak
												}
												onClick={() =>
													navigate(
														`/admin?quote=${item.quoteIdString}`,
													)
												}>
												{item.quoteIdString}
											</span>
										</div>

										<div>
											<span className={styles.metaLabel}>
												Source
											</span>
											<span className={styles.metaValue}>
												{item.source || "-"}
											</span>
										</div>

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

                                        
									</div>
								</div>
							);
						})}
					</div>
				) : !loading ? (
					<div className={styles.empty}>No activity found.</div>
				) : null}
			</div>
		</div>
	);
}
