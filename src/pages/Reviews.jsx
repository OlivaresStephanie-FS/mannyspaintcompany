import { useEffect, useState } from "react";
import styles from "./Reviews.module.css";

function Stars({ rating = 0 }) {
	const r = Math.max(0, Math.min(5, Number(rating) || 0));
	return (
		<div className={styles.stars} aria-label={`${r} out of 5 stars`}>
			{[1, 2, 3, 4, 5].map((n) => (
				<span
					key={n}
					className={n <= r ? styles.starOn : styles.starOff}
					aria-hidden="true"
				>
					★
				</span>
			))}
		</div>
	);
}

function formatDate(v) {
	try {
		return new Date(v).toLocaleDateString();
	} catch {
		return "";
	}
}

export default function Reviews() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let alive = true;

		(async () => {
			setLoading(true);
			setError("");

			try {
				const res = await fetch("/.netlify/functions/public-reviews?limit=50");
				const data = await res.json().catch(() => ({}));

				if (!res.ok) throw new Error(data.error || "Failed to load reviews.");

				if (alive) setItems(Array.isArray(data.items) ? data.items : []);
			} catch (e) {
				if (alive) setError(e.message || "Failed to load reviews.");
			} finally {
				if (alive) setLoading(false);
			}
		})();

		return () => {
			alive = false;
		};
	}, []);

	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<h1 className={styles.h1}>Customer Reviews</h1>
				<p className={styles.sub}>
					Verified feedback from Manny’s Painting Company clients.
				</p>
			</header>

			{loading && <div className={styles.state}>Loading reviews…</div>}

			{!loading && error && (
				<div className={styles.errorBox}>
					<div className={styles.errorTitle}>Couldn’t load reviews</div>
					<div className={styles.errorText}>{error}</div>
				</div>
			)}

			{!loading && !error && items.length === 0 && (
				<div className={styles.state}>No reviews yet. Check back soon.</div>
			)}

			{!loading && !error && items.length > 0 && (
				<div className={styles.grid}>
					{items.map((r) => (
						<article key={r._id} className={styles.card}>
							<div className={styles.top}>
								<Stars rating={r.rating} />
								<div className={styles.meta}>
									<span className={styles.name}>{r.name || "Anonymous"}</span>
									<span className={styles.dot}>•</span>
									<span className={styles.date}>{formatDate(r.createdAt)}</span>
								</div>
							</div>

							{r.text ? (
								<p className={styles.text}>{r.text}</p>
							) : (
								<p className={styles.textMuted}>No written feedback provided.</p>
							)}

							{r.serviceType && <div className={styles.badge}>{r.serviceType}</div>}
						</article>
					))}
				</div>
			)}
		</div>
	);
}