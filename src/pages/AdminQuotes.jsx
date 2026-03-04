import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, clearToken } from "../lib/adminAuth";
import styles from "./AdminQuotes.module.css";

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

const LIMIT = 20;
const STATUS_OPTIONS = [
	"new",
	"contacted",
	"scheduled",
	"completed",
	"archived",
];

export default function AdminQuotes() {
	const navigate = useNavigate();

	const [items, setItems] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// status UI state
	const [draftStatus, setDraftStatus] = useState({});
	const [savingIds, setSavingIds] = useState(() => new Set());

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
				{ headers: { Authorization: `Bearer ${t}` } },
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

			const list = Array.isArray(data.items) ? data.items : [];
			setItems(list);
			setTotal(Number(data.total || 0));
			setPage(Number(data.page || p));

			// keep draftStatus in sync with fetched data
			setDraftStatus((cur) => {
				const next = { ...cur };
				for (const q of list) {
					if (q?._id && next[q._id] == null) {
						next[q._id] = q.status || "new";
					}
				}
				return next;
			});
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

	// auto-refresh quotes every 15 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			load(page);
		}, 15000);

		return () => clearInterval(interval);
	}, [page]);

	async function saveQuoteStatus(quoteId) {
		setError("");

		const t = String(getToken() || "").trim();
		if (!t) {
			clearToken();
			navigate("/admin/login");
			return;
		}

		const nextStatus = draftStatus[quoteId] || "new";

		// lock row
		setSavingIds((s) => new Set(s).add(quoteId));

		// optimistic UI
		const prev = items;
		setItems((cur) =>
			cur.map((q) =>
				q._id === quoteId ? { ...q, status: nextStatus } : q,
			),
		);

		try {
			const res = await fetch(
				"/.netlify/functions/admin-update-quote-status",
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${t}`,
					},
					body: JSON.stringify({ quoteId, status: nextStatus }),
				},
			);

			if (res.status === 401) {
				clearToken();
				navigate("/admin/login");
				return;
			}

			const data = await res.json().catch(() => ({}));
			if (!res.ok || !data.ok) {
				throw new Error(data?.error || "Update failed");
			}

			if (data.quote?._id) {
				setItems((cur) =>
					cur.map((q) => (q._id === quoteId ? data.quote : q)),
				);
				setDraftStatus((cur) => ({
					...cur,
					[quoteId]: data.quote.status || nextStatus,
				}));
			}
		} catch (e) {
			setItems(prev);
			setError(e?.message || "Update failed");
		} finally {
			setSavingIds((s) => {
				const next = new Set(s);
				next.delete(quoteId);
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
			<div className={styles.card}>
				<h1 className={styles.h1}>Admin — Quotes</h1>
				<p className={styles.subhead}>
					View submitted quotes + uploaded files.
				</p>

				<div className={styles.row}>
					<button
						className={`${styles.btn} ${styles.btnPrimary}`}
						onClick={() => load(1)}
						disabled={loading}
						type="button">
						{loading ? "Loading..." : "Refresh"}{" "}
						<span className={styles.liveIndicator}>Live</span>
					</button>

					<button
						className={styles.btn}
						onClick={logout}
						type="button"
						disabled={loading}>
						Log out
					</button>

					<div className={styles.muted}>
						Total: <b>{total}</b>
					</div>
				</div>

				{error ? <div className={styles.err}>{error}</div> : null}

				<div className={styles.tableWrap}>
					<table className={styles.table}>
						<thead>
							<tr>
								<th className={styles.th}>Submitted</th>
								<th className={styles.th}>Client</th>
								<th className={styles.th}>Service</th>
								<th className={styles.th}>Status</th>
								<th className={styles.th}>Uploads</th>
							</tr>
						</thead>

						<tbody>
							{items.map((q) => {
								const uploads = Array.isArray(q.uploads)
									? q.uploads
									: [];

								const desc = String(q.description || "");
								const descShort =
									desc.length > 110
										? `${desc.slice(0, 110)}…`
										: desc;

								const currentStatus = q.status || "new";
								const draft =
									draftStatus[q._id] || currentStatus;
								const busy = savingIds.has(q._id);
								const changed = draft !== currentStatus;

								return (
									<tr key={q._id}>
										<td className={styles.td}>
											{formatDate(q.submittedAt)}
										</td>

										<td className={styles.td}>
											<div className={styles.name}>
												{q.name || "-"}
											</div>
											<div className={styles.sub}>
												{q.phone || ""}
											</div>
											<div className={styles.sub}>
												{q.email || ""}
											</div>
										</td>

										<td className={styles.td}>
											<div
												className={styles.serviceTitle}>
												{q.service || "-"}
											</div>
											<div
												className={styles.desc}
												title={desc}>
												{descShort}
											</div>
										</td>

										<td className={styles.td}>
											<div className={styles.statusCell}>
												<select
													className={styles.select}
													value={draft}
													disabled={busy || loading}
													onChange={(e) =>
														setDraftStatus(
															(cur) => ({
																...cur,
																[q._id]:
																	e.target
																		.value,
															}),
														)
													}>
													{STATUS_OPTIONS.map((s) => (
														<option
															key={s}
															value={s}>
															{s}
														</option>
													))}
												</select>

												<button
													type="button"
													className={`${styles.btnSmall} ${styles.btnPrimary}`}
													disabled={
														busy ||
														loading ||
														!changed
													}
													onClick={() =>
														saveQuoteStatus(q._id)
													}>
													{busy
														? "Saving…"
														: changed
															? "Save"
															: "Saved"}
												</button>

												<span
													className={`${styles.statusPill} ${styles[q.status]}`}>
													{q.status || "new"}
												</span>
											</div>
										</td>

										<td className={styles.td}>
											{uploads.length ? (
												<div className={styles.thumbs}>
													{uploads
														.slice(0, 6)
														.map((u, idx) => {
															const isImage =
																String(
																	u.resourceType ||
																		"",
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
																	key={`${q._id}-${idx}`}>
																	{isImage ? (
																		<a
																			href={
																				fullUrl
																			}
																			target="_blank"
																			rel="noreferrer">
																			<img
																				src={
																					thumbUrl
																				}
																				alt={
																					u.originalFilename ||
																					"upload"
																				}
																				className={
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
																			className={
																				styles.fileLink
																			}>
																			Open
																			file
																		</a>
																	)}
																</div>
															);
														})}
												</div>
											) : (
												<span className={styles.muted}>
													None
												</span>
											)}
										</td>
									</tr>
								);
							})}

							{!items.length && !loading ? (
								<tr>
									<td className={styles.td} colSpan={5}>
										<span className={styles.muted}>
											No quotes found.
										</span>
									</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>

				<div className={styles.pager}>
					<button
						className={styles.btn}
						onClick={() => load(Math.max(1, page - 1))}
						disabled={loading || page <= 1}
						type="button">
						Prev
					</button>

					<div className={styles.muted}>
						Page <b>{page}</b> of <b>{totalPages}</b>
					</div>

					<button
						className={styles.btn}
						onClick={() => load(Math.min(totalPages, page + 1))}
						disabled={loading || page >= totalPages}
						type="button">
						Next
					</button>
				</div>
			</div>
		</div>
	);
}
