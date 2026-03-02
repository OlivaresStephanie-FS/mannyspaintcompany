import { useEffect, useState } from "react";

export default function AdminReviews() {
	// ✅ token (editable + persisted)
	const [token, setToken] = useState(
		() => localStorage.getItem("ADMIN_TOKEN") || "",
	);

	useEffect(() => {
		localStorage.setItem("ADMIN_TOKEN", token);
	}, [token]);

	function saveToken(v) {
		setToken(v);
	}

	// ✅ missing state (this is why your page went blank)
	const [status, setStatus] = useState("pending");
	const [page, setPage] = useState(1);
	const [items, setItems] = useState([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState("");

	async function load() {
		setLoading(true);
		setErr("");

		try {
			const cleanToken = String(token || "").trim();
			if (!cleanToken) throw new Error("Missing admin token");

			const res = await fetch(
				`/.netlify/functions/admin-reviews?status=${encodeURIComponent(
					status,
				)}&page=${page}&limit=10`,
				{
					headers: { Authorization: `Bearer ${cleanToken}` },
				},
			);

			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.error || "Failed to load reviews");

			// ✅ support either {items: []} or {reviews: []}
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
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, page, token]); // ✅ reload when token changes

	async function setReviewStatus(reviewId, nextStatus) {
		setErr("");

		try {
			const cleanToken = String(token || "").trim();
			if (!cleanToken) throw new Error("Missing admin token");

			const res = await fetch("/.netlify/functions/admin-update-review-status", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${cleanToken}`,
				},
				body: JSON.stringify({ reviewId, status: nextStatus }),
			});

			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.error || "Update failed");

			await load();
		} catch (e) {
			setErr(e?.message || "Error");
		}
	}

	const totalPages = Math.max(1, Math.ceil(total / 10));

	return (
		<div style={{ maxWidth: 900, margin: "40px auto", padding: "0 18px" }}>
			<h2 style={{ marginBottom: 10 }}>Reviews</h2>

			<div
				style={{
					display: "flex",
					gap: 10,
					alignItems: "center",
					flexWrap: "wrap",
				}}
			>
				<input
					value={token}
					onChange={(e) => saveToken(e.target.value)}
					placeholder="Admin token"
					style={{
						padding: "10px 12px",
						borderRadius: 10,
						border: "1px solid #ddd",
						minWidth: 320,
					}}
				/>

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
				>
					<option value="pending">Pending</option>
					<option value="approved">Approved</option>
					<option value="rejected">Rejected</option>
					<option value="all">All</option>
				</select>

				<button
					onClick={load}
					style={{
						padding: "10px 14px",
						borderRadius: 10,
						border: "none",
						background: "#111",
						color: "white",
						fontWeight: 800,
						cursor: "pointer",
					}}
					disabled={loading}
				>
					{loading ? "Loading…" : "Load"}
				</button>

				{err && <span style={{ color: "crimson" }}>{err}</span>}
			</div>

			<div style={{ marginTop: 18, display: "grid", gap: 12 }}>
				{items.map((r) => (
					<div
						key={r._id}
						style={{
							border: "1px solid #eee",
							borderRadius: 12,
							padding: 14,
							background: "#fff",
						}}
					>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<div style={{ fontWeight: 700 }}>
								{renderStars(Number(r.rating || 0))}{" "}
								<span style={{ color: "#777", fontWeight: 400 }}>
									({r.status})
								</span>
							</div>
							<div style={{ color: "#777", fontSize: 12 }}>
								{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : ""}
							</div>
						</div>

						<div style={{ marginTop: 8, color: "#222" }}>
							{r.text ? r.text : <span style={{ color: "#888" }}>(no text)</span>}
						</div>

						<div style={{ marginTop: 8, color: "#555", fontSize: 13 }}>
							— {r.name || "Anonymous"} {r.service ? `• ${r.service}` : ""}
						</div>

						<div style={{ marginTop: 12, display: "flex", gap: 10 }}>
							<button
								onClick={() => setReviewStatus(r._id, "approved")}
								disabled={r.status === "approved"}
							>
								Approve
							</button>
							<button
								onClick={() => setReviewStatus(r._id, "rejected")}
								disabled={r.status === "rejected"}
							>
								Reject
							</button>
							<button
								onClick={() => setReviewStatus(r._id, "pending")}
								disabled={r.status === "pending"}
							>
								Set Pending
							</button>
						</div>
					</div>
				))}

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
				}}
			>
				<button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
					Prev
				</button>
				<div style={{ color: "#555" }}>
					Page {page} / {totalPages}
				</div>
				<button
					onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					disabled={page >= totalPages}
				>
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