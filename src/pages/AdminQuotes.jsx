import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, clearToken } from "../lib/adminAuth";

function formatDate(v) {
	try {
		return new Date(v).toLocaleString();
	} catch {
		return "";
	}
}

// Builds a thumbnail URL from the original Cloudinary secure_url
// by inserting a transformation after `/upload/`
function toThumbUrl(url, w = 140, h = 100) {
	if (!url || typeof url !== "string") return "";
	const needle = "/upload/";
	if (!url.includes(needle)) return url;
	const transform = `c_fill,w_${w},h_${h},q_auto,f_auto/`;
	return url.replace(needle, `${needle}${transform}`);
}

const styles = {
	page: { maxWidth: 1100, margin: "0 auto", padding: 24 },
	card: {
		background: "white",
		border: "1px solid #eee",
		borderRadius: 14,
		padding: 16,
	},
	row: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
	label: { fontSize: 13, fontWeight: 700, color: "#222" },
	btn: {
		padding: "10px 12px",
		borderRadius: 10,
		border: "1px solid #ddd",
		background: "white",
		fontWeight: 800,
		cursor: "pointer",
	},
	btnPrimary: {
		padding: "10px 12px",
		borderRadius: 10,
		border: "none",
		background: "#111",
		color: "white",
		fontWeight: 800,
		cursor: "pointer",
	},
	err: {
		marginTop: 12,
		padding: "10px 12px",
		borderRadius: 10,
		background: "#fff5f5",
		border: "1px solid #ffd6d6",
		color: "#b00020",
		fontSize: 13,
	},
	tableWrap: { overflowX: "auto", marginTop: 16 },
	table: { width: "100%", borderCollapse: "collapse" },
	th: {
		textAlign: "left",
		fontSize: 12,
		color: "#555",
		padding: "10px 8px",
		borderBottom: "1px solid #eee",
		whiteSpace: "nowrap",
	},
	td: {
		padding: "10px 8px",
		borderBottom: "1px solid #f1f1f1",
		verticalAlign: "top",
	},
	name: { fontWeight: 800, color: "#111" },
	sub: { fontSize: 12, color: "#666", marginTop: 2 },
	chip: {
		display: "inline-block",
		padding: "4px 8px",
		borderRadius: 999,
		border: "1px solid #ddd",
		fontSize: 12,
		fontWeight: 800,
	},
	thumbs: { display: "flex", gap: 8, flexWrap: "wrap" },
	thumb: {
		width: 140,
		height: 100,
		objectFit: "cover",
		borderRadius: 10,
		border: "1px solid #eee",
		display: "block",
	},
	link: { fontSize: 12, fontWeight: 800, color: "#111" },
	pager: {
		display: "flex",
		gap: 10,
		alignItems: "center",
		marginTop: 14,
		flexWrap: "wrap",
	},
	muted: { fontSize: 12, color: "#666" },
};

const LIMIT = 20;

export default function AdminQuotes() {
	const navigate = useNavigate();

	const [items, setItems] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

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

	async function load(p = 1) {
		setError("");
		setLoading(true);

		try {
			const t = String(getToken() || "").trim();
			if (!t) {
				clearToken();
				navigate("/admin/login");
				return;
			}

			const res = await fetch(
				`/.netlify/functions/admin-quotes?page=${p}&limit=${LIMIT}`,
				{
					headers: { Authorization: `Bearer ${t}` },
				},
			);

			// ✅ If JWT expired/invalid, force relogin
			if (res.status === 401) {
				clearToken();
				navigate("/admin/login");
				return;
			}

			const data = await res.json().catch(() => ({}));
			if (!res.ok || !data.ok) {
				throw new Error(data?.error || "Failed to load quotes");
			}

			setItems(Array.isArray(data.items) ? data.items : []);
			setTotal(Number(data.total || 0));
			setPage(Number(data.page || p));
		} catch (e) {
			setItems([]);
			setTotal(0);
			setError(e?.message || "Error loading quotes");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function logout() {
		clearToken();
		navigate("/admin/login");
	}

	return (
		<div style={styles.page}>
			<div style={styles.card}>
				<h1 style={{ margin: 0 }}>Admin — Quotes</h1>
				<p style={{ marginTop: 8, marginBottom: 16, color: "#555" }}>
					View submitted quotes + uploaded files.
				</p>

				<div style={styles.row}>
					<button
						style={styles.btnPrimary}
						onClick={() => load(1)}
						disabled={loading}
					>
						{loading ? "Loading..." : "Refresh"}
					</button>

					<button style={styles.btn} onClick={logout}>
						Log out
					</button>

					<div style={styles.muted}>
						Total: <b>{total}</b>
					</div>
				</div>

				{error ? <div style={styles.err}>{error}</div> : null}

				<div style={styles.tableWrap}>
					<table style={styles.table}>
						<thead>
							<tr>
								<th style={styles.th}>Submitted</th>
								<th style={styles.th}>Client</th>
								<th style={styles.th}>Service</th>
								<th style={styles.th}>Status</th>
								<th style={styles.th}>Uploads</th>
							</tr>
						</thead>
						<tbody>
							{items.map((q) => {
								const uploads = Array.isArray(q.uploads)
									? q.uploads
									: [];
								return (
									<tr key={q._id}>
										<td style={styles.td}>
											{formatDate(q.submittedAt)}
										</td>

										<td style={styles.td}>
											<div style={styles.name}>
												{q.name || "-"}
											</div>
											<div style={styles.sub}>
												{q.phone || ""}
											</div>
											<div style={styles.sub}>
												{q.email || ""}
											</div>
										</td>

										<td style={styles.td}>
											<div style={{ fontWeight: 800 }}>
												{q.service || "-"}
											</div>
											<div
												style={styles.sub}
												title={q.description || ""}
											>
												{(q.description || "").slice(
													0,
													110,
												)}
												{(q.description || "").length >
												110
													? "…"
													: ""}
											</div>
										</td>

										<td style={styles.td}>
											<span style={styles.chip}>
												{q.status || "new"}
											</span>
										</td>

										<td style={styles.td}>
											{uploads.length ? (
												<div style={styles.thumbs}>
													{uploads
														.slice(0, 6)
														.map((u, idx) => {
															const isImage =
																(
																	u.resourceType ||
																	""
																).toLowerCase() ===
																"image";
															const fullUrl =
																u.url;
															const thumbUrl =
																isImage
																	? toThumbUrl(
																			fullUrl,
																		)
																	: "";

															return (
																<div
																	key={`${q._id}-${idx}`}
																>
																	{isImage ? (
																		<a
																			href={
																				fullUrl
																			}
																			target="_blank"
																			rel="noreferrer"
																		>
																			<img
																				src={
																					thumbUrl
																				}
																				alt={
																					u.originalFilename ||
																					"upload"
																				}
																				style={
																					styles.thumb
																				}
																			/>
																		</a>
																	) : (
																		<a
																			href={
																				fullUrl
																			}
																			target="_blank"
																			rel="noreferrer"
																			style={
																				styles.link
																			}
																		>
																			Open
																			file
																		</a>
																	)}
																</div>
															);
														})}
												</div>
											) : (
												<span style={styles.muted}>
													None
												</span>
											)}
										</td>
									</tr>
								);
							})}

							{!items.length && !loading ? (
								<tr>
									<td style={styles.td} colSpan={5}>
										<span style={styles.muted}>
											No quotes found.
										</span>
									</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>

				<div style={styles.pager}>
					<button
						style={styles.btn}
						onClick={() => load(Math.max(1, page - 1))}
						disabled={loading || page <= 1}
					>
						Prev
					</button>

					<div style={styles.muted}>
						Page <b>{page}</b> of <b>{totalPages}</b>
					</div>

					<button
						style={styles.btn}
						onClick={() => load(Math.min(totalPages, page + 1))}
						disabled={loading || page >= totalPages}
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}