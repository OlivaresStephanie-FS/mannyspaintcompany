import { useEffect, useMemo, useState } from "react";
import { getToken, clearToken } from "../lib/adminAuth";
import { useNavigate } from "react-router-dom";
import styles from "./AdminReviews.module.css";
import AdminNav from "../components/AdminNav";

const LIMIT = 10;

export default function AdminReviews() {
	const navigate = useNavigate();

	const [status, setStatus] = useState("pending");
	const [page, setPage] = useState(1);

	const [items, setItems] = useState([]);
	const [total, setTotal] = useState(0);

	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState("");

	const [updatingIds, setUpdatingIds] = useState(() => new Set());

	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(total / LIMIT)),
		[total],
	);

	useEffect(() => {
		const t = String(getToken() || "").trim();
		if (!t) navigate("/admin/login");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function load(p = page, s = status) {
		setLoading(true);
		setErr("");

		try {
			const t = String(getToken() || "").trim();
			if (!t) {
				clearToken();
				navigate("/admin/login");
				return;
			}

			const res = await fetch(
				`/.netlify/functions/admin-reviews?status=${encodeURIComponent(
					s,
				)}&page=${p}&limit=${LIMIT}`,
				{ headers: { Authorization: `Bearer ${t}` } },
			);

			if (res.status === 401) {
				clearToken();
				navigate("/admin/login");
				return;
			}

			const data = await res.json().catch(() => ({}));
			if (!res.ok)
				throw new Error(data.error || "Failed to load reviews");

			const list = data.items || data.reviews || [];
			setItems(Array.isArray(list) ? list : []);
			setTotal(Number(data.total || 0));
		} catch (e) {
			setItems([]);
			setTotal(0);
			setErr(e?.message || "Error");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load(page, status);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, page]);

	async function setReviewStatus(reviewId, nextStatus) {
		setErr("");

		const t = String(getToken() || "").trim();
		if (!t) {
			clearToken();
			navigate("/admin/login");
			return;
		}

		const prev = items;
		setItems((cur) =>
			cur.map((r) =>
				r._id === reviewId ? { ...r, status: nextStatus } : r,
			),
		);

		setUpdatingIds((s) => new Set(s).add(reviewId));

		try {
			const res = await fetch(
				"/.netlify/functions/admin-update-review-status",
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${t}`,
					},
					body: JSON.stringify({ reviewId, status: nextStatus }),
				},
			);

			if (res.status === 401) {
				clearToken();
				navigate("/admin/login");
				return;
			}

			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.error || "Update failed");

			if (data.review?._id) {
				setItems((cur) =>
					cur.map((r) => (r._id === reviewId ? data.review : r)),
				);
			}
		} catch (e) {
			setItems(prev);
			setErr(e?.message || "Error");
		} finally {
			setUpdatingIds((s) => {
				const next = new Set(s);
				next.delete(reviewId);
				return next;
			});
		}
	}

	function logout() {
		clearToken();
		navigate("/admin/login");
	}

	return (
		<div className={styles.page}>
			<AdminNav />
			<h2 className={styles.h2}>Reviews</h2>

			<div className={styles.toolbar}>
				<select
					value={status}
					onChange={(e) => {
						setPage(1);
						setStatus(e.target.value);
					}}
					className={styles.select}
					disabled={loading}>
					<option value="pending">Pending</option>
					<option value="approved">Approved</option>
					<option value="rejected">Rejected</option>
					<option value="all">All</option>
				</select>

				<button
					onClick={() => load(page, status)}
					disabled={loading}
					className={`${styles.btn} ${styles.btnPrimary}`}
					type="button">
					{loading ? "Loading…" : "Refresh"}
				</button>

				<button
					onClick={logout}
					disabled={loading}
					className={`${styles.btn} ${styles.btnOutline}`}
					type="button">
					Log out
				</button>

				{err && <span className={styles.err}>{err}</span>}
			</div>

			<div className={styles.list}>
				{items.map((r) => {
					const busy = updatingIds.has(r._id);

					return (
						<div
							key={r._id}
							className={`${styles.card} ${busy ? styles.cardBusy : ""}`}>
							<div className={styles.topRow}>
								<div className={styles.ratingLine}>
									<Stars n={Number(r.rating || 0)} />
									<span className={styles.status}>
										({r.status})
									</span>
								</div>

								<div className={styles.time}>
									{r.submittedAt
										? new Date(
												r.submittedAt,
											).toLocaleString()
										: ""}
								</div>
							</div>

							<div className={styles.text}>
								{r.text ? (
									r.text
								) : (
									<span className={styles.noText}>
										(no text)
									</span>
								)}
							</div>

							<div className={styles.meta}>
								— {r.name || "Anonymous"}{" "}
								{r.service ? `• ${r.service}` : ""}
							</div>

							<div className={styles.actions}>
								<button
									onClick={() =>
										setReviewStatus(r._id, "approved")
									}
									disabled={busy || r.status === "approved"}
									className={styles.btnSmall}
									type="button">
									{busy ? "Saving…" : "Approve"}
								</button>

								<button
									onClick={() =>
										setReviewStatus(r._id, "rejected")
									}
									disabled={busy || r.status === "rejected"}
									className={styles.btnSmall}
									type="button">
									Reject
								</button>

								<button
									onClick={() =>
										setReviewStatus(r._id, "pending")
									}
									disabled={busy || r.status === "pending"}
									className={styles.btnSmall}
									type="button">
									Set Pending
								</button>
							</div>
						</div>
					);
				})}

				{!loading && items.length === 0 && (
					<div className={styles.empty}>No reviews found.</div>
				)}
			</div>

			<div className={styles.pager}>
				<button
					onClick={() => setPage((p) => Math.max(1, p - 1))}
					disabled={page <= 1 || loading}
					className={styles.btnSmall}
					type="button">
					Prev
				</button>

				<div className={styles.pageText}>
					Page {page} / {totalPages}
				</div>

				<button
					onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					disabled={page >= totalPages || loading}
					className={styles.btnSmall}
					type="button">
					Next
				</button>
			</div>
		</div>
	);
}

function Stars({ n }) {
	const rating = Math.max(0, Math.min(5, Number(n || 0)));
	const filled = "★".repeat(rating);
	const empty = "☆".repeat(5 - rating);

	return (
		<div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
			<span className={styles.starOn}>{filled}</span>
			<span className={styles.starOff}>{empty}</span>
		</div>
	);
}
