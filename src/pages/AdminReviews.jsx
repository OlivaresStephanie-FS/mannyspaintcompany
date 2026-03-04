import { useEffect, useMemo, useState } from "react";
import { getToken, clearToken } from "../lib/adminAuth";
import { useNavigate } from "react-router-dom";

const LIMIT = 10;

export default function AdminReviews() {
	const navigate = useNavigate();

	const [status, setStatus] = useState("pending");
	const [page, setPage] = useState(1);

	const [items, setItems] = useState([]);
	const [total, setTotal] = useState(0);

	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState("");

	// Row locks (prevents double clicks)
	const [updatingIds, setUpdatingIds] = useState(() => new Set());

	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(total / LIMIT)),
		[total],
	);

	// ✅ Guard: must be logged in
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

	// Load on filter/page changes
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

		// 1) Optimistic UI
		const prev = items;
		setItems((cur) =>
			cur.map((r) =>
				r._id === reviewId ? { ...r, status: nextStatus } : r,
			),
		);

		// 2) Lock row
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

			// 3) Use returned review (if provided)
			if (data.review?._id) {
				setItems((cur) =>
					cur.map((r) => (r._id === reviewId ? data.review : r)),
				);
			}
		} catch (e) {
			// 4) Rollback
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
		<div style={{ maxWidth: 900, margin: "40px auto", padding: "0 18px" }}>
			<h2 style={{ marginBottom: 10 }}>Reviews</h2>

			<div
				style={{
					display: "flex",
					gap: 10,
					alignItems: "center",
					flexWrap: "wrap",
				}}>
				<select
					value={status}
					onChange={(e) => {
						setPage(1);
						setStatus(e.target.value);
					}}
					style={{
						padding: "10px 12px",
						borderRadius: 10,
						border: "1px solid #ddd",
					}}
					disabled={loading}>
					<option value="pending">Pending</option>
					<option value="approved">Approved</option>
					<option value="rejected">Rejected</option>
					<option value="all">All</option>
				</select>

				<button
					onClick={() => load(page, status)}
					disabled={loading}
					style={{
						padding: "10px 14px",
						borderRadius: 10,
						border: "none",
						background: "#111",
						color: "white",
						fontWeight: 800,
						cursor: "pointer",
					}}>
					{loading ? "Loading…" : "Refresh"}
				</button>

				<button
					onClick={logout}
					disabled={loading}
					style={{
						padding: "10px 14px",
						borderRadius: 10,
						border: "1px solid #ddd",
						background: "white",
						fontWeight: 800,
						cursor: "pointer",
					}}>
					Log out
				</button>

				{err && <span style={{ color: "crimson" }}>{err}</span>}
			</div>

			<div style={{ marginTop: 18, display: "grid", gap: 12 }}>
				{items.map((r) => {
					const busy = updatingIds.has(r._id);

					return (
						<div
							key={r._id}
							style={{
								border: "1px solid #eee",
								borderRadius: 12,
								padding: 14,
								background: "#fff",
								opacity: busy ? 0.7 : 1,
							}}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
								}}>
								<div style={{ fontWeight: 700 }}>
									{renderStars(Number(r.rating || 0))}{" "}
									<span
										style={{
											color: "#777",
											fontWeight: 400,
										}}>
										({r.status})
									</span>
								</div>
								<div style={{ color: "#777", fontSize: 12 }}>
									{r.submittedAt
										? new Date(
												r.submittedAt,
											).toLocaleString()
										: ""}
								</div>
							</div>

							<div style={{ marginTop: 8, color: "#222" }}>
								{r.text ? (
									r.text
								) : (
									<span style={{ color: "#888" }}>
										(no text)
									</span>
								)}
							</div>

							<div
								style={{
									marginTop: 8,
									color: "#555",
									fontSize: 13,
								}}>
								— {r.name || "Anonymous"}{" "}
								{r.service ? `• ${r.service}` : ""}
							</div>

							<div
								style={{
									marginTop: 12,
									display: "flex",
									gap: 10,
								}}>
								<button
									onClick={() =>
										setReviewStatus(r._id, "approved")
									}
									disabled={busy || r.status === "approved"}>
									{busy ? "Saving…" : "Approve"}
								</button>
								<button
									onClick={() =>
										setReviewStatus(r._id, "rejected")
									}
									disabled={busy || r.status === "rejected"}>
									Reject
								</button>
								<button
									onClick={() =>
										setReviewStatus(r._id, "pending")
									}
									disabled={busy || r.status === "pending"}>
									Set Pending
								</button>
							</div>
						</div>
					);
				})}

				{!loading && items.length === 0 && (
					<div style={{ color: "#777" }}>No reviews found.</div>
				)}
			</div>

			<div
				style={{
					marginTop: 18,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}>
				<button
					onClick={() => setPage((p) => Math.max(1, p - 1))}
					disabled={page <= 1 || loading}>
					Prev
				</button>

				<div style={{ color: "#555" }}>
					Page {page} / {totalPages}
				</div>

				<button
					onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					disabled={page >= totalPages || loading}>
					Next
				</button>
			</div>
		</div>
	);
}

function renderStars(n) {
	const v = Math.max(0, Math.min(5, Number(n) || 0));
	const filled = "★".repeat(v);
	const empty = "☆".repeat(5 - v);
	return (
		<span style={{ color: "#f5b301", fontSize: 18 }}>
			{filled}
			<span style={{ color: "#ccc" }}>{empty}</span>
		</span>
	);
}
