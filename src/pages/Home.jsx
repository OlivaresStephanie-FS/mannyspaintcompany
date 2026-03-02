import { useEffect, useState } from "react";
import QuoteForm from "../components/QuoteForm";

const styles = {
	page: { maxWidth: 1100, margin: "0 auto", padding: "28px 24px" },
	hero: {
		display: "grid",
		gridTemplateColumns: "1.15fr 0.85fr",
		gap: 20,
		alignItems: "start",
		padding: 18,
		background: "#fafafa",
		border: "1px solid #eee",
		borderRadius: 16,
	},
	h1: { fontSize: 40, lineHeight: 1.05, margin: 0, color: "#111" },
	p: {
		marginTop: 12,
		marginBottom: 0,
		color: "#555",
		fontSize: 16,
		lineHeight: 1.5,
	},
	ctas: { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" },
	btnPrimary: {
		padding: "12px 14px",
		borderRadius: 10,
		border: "none",
		background: "#111",
		color: "white",
		fontWeight: 700,
		cursor: "pointer",
		textDecoration: "none",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
	},
	btnGhost: {
		padding: "12px 14px",
		borderRadius: 10,
		border: "1px solid #ddd",
		background: "white",
		color: "#111",
		fontWeight: 700,
		cursor: "pointer",
		textDecoration: "none",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
	},
	section: { marginTop: 28 },
	sectionTitle: { margin: "0 0 10px 0", fontSize: 18, color: "#111" },
	services: {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gap: 12,
	},
	card: {
		padding: 14,
		borderRadius: 14,
		border: "1px solid #eee",
		background: "white",
	},
	cardTitle: { margin: 0, fontWeight: 800, color: "#111" },
	cardText: {
		marginTop: 6,
		marginBottom: 0,
		color: "#555",
		fontSize: 14,
		lineHeight: 1.45,
	},
	quoteGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 },
	small: { color: "#666", fontSize: 14, lineHeight: 1.5 },

	// --- Reviews styles ---
	reviewsGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gap: 12,
	},
	reviewCard: {
		padding: 14,
		borderRadius: 14,
		border: "1px solid #eee",
		background: "white",
	},
	reviewText: {
		marginTop: 8,
		marginBottom: 0,
		color: "#222",
		lineHeight: 1.5,
		fontSize: 14,
		whiteSpace: "pre-wrap",
	},
	reviewMeta: {
		marginTop: 10,
		color: "#666",
		fontSize: 13,
	},
	stars: { fontSize: 18, letterSpacing: 1 },
};

function Stars({ n }) {
	const rating = Math.max(0, Math.min(5, Number(n || 0)));
	const filled = "★".repeat(rating);
	const empty = "☆".repeat(5 - rating);

	return (
		<div style={styles.stars} aria-label={`${rating} out of 5 stars`}>
			<span style={{ color: "#f5b301" }}>{filled}</span>
			<span style={{ color: "#ccc" }}>{empty}</span>
		</div>
	);
}

function ReviewsSection() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let alive = true;

		(async () => {
			try {
				const res = await fetch(
					"/.netlify/functions/public-reviews?limit=6",
				);
				const data = await res.json().catch(() => ({}));
				if (!alive) return;
				setItems(Array.isArray(data.items) ? data.items : []);
			} catch {
				if (!alive) return;
				setItems([]);
			} finally {
				if (!alive) return;
				setLoading(false);
			}
		})();

		return () => {
			alive = false;
		};
	}, []);

	if (loading) return null;
	if (!items.length) return null;

	return (
		<section style={styles.section}>
			<h2 style={styles.sectionTitle}>Customer Reviews</h2>
			<div style={styles.reviewsGrid}>
				{items.map((r) => (
					<div
						key={r._id || `${r.submittedAt}-${Math.random()}`}
						style={styles.reviewCard}>
						<Stars n={r.rating} />
						<p style={styles.reviewText}>
							{r.text ? (
								r.text
							) : (
								<span style={{ color: "#888" }}>
									(No comment)
								</span>
							)}
						</p>
						<div style={styles.reviewMeta}>
							— {r.name || "Anonymous"}{" "}
							{r.service ? `• ${r.service}` : ""}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

export default function Home() {
	function scrollToQuote() {
		const el = document.getElementById("quote");
		if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
	}

	return (
		<div style={styles.page}>
			{/* HERO */}
			<section style={styles.hero}>
				<div>
					<h1 style={styles.h1}>
						High-quality painting & renovation work—done clean.
					</h1>
					<p style={styles.p}>
						Interior painting, patching, trim, doors, and refresh
						projects. Share a few details and photos and we’ll send
						a fast quote.
					</p>

					<div style={styles.ctas}>
						<button
							style={styles.btnPrimary}
							onClick={scrollToQuote}>
							Request a Quote
						</button>
						<a style={styles.btnGhost} href="/gallery">
							View Gallery
						</a>
					</div>

					<p style={{ ...styles.small, marginTop: 14 }}>
						Serving NYC / NJ • Flexible scheduling • Clear scope &
						pricing
					</p>
				</div>

				<div>
					<div style={{ ...styles.card, background: "white" }}>
						<div
							style={{
								fontWeight: 800,
								color: "#111",
								marginBottom: 6,
							}}>
							Quick Contact
						</div>
						<div style={styles.small}>
							Phone: (917) 326-1720 <br />
							Email: manuelico11@gmail.com <br />
							Hours: Mon–Sat
						</div>
						<div style={{ ...styles.small, marginTop: 10 }}>
							Replace these placeholders with your real business
							info.
						</div>
					</div>
				</div>
			</section>

			{/* SERVICES */}
			<section style={styles.section}>
				<h2 style={styles.sectionTitle}>Services</h2>
				<div style={styles.services}>
					<div style={styles.card}>
						<p style={styles.cardTitle}>Interior Painting</p>
						<p style={styles.cardText}>
							Walls, ceilings, closets, and crisp cut-lines.
						</p>
					</div>
					<div style={styles.card}>
						<p style={styles.cardTitle}>Patching & Repair</p>
						<p style={styles.cardText}>
							Holes, cracks, water stains, smoothing & prep.
						</p>
					</div>
					<div style={styles.card}>
						<p style={styles.cardTitle}>Trim, Doors & Baseboards</p>
						<p style={styles.cardText}>
							Sanding, priming, and durable finishes.
						</p>
					</div>
				</div>
			</section>

			{/* QUOTE */}
			<section id="quote" style={styles.section}>
				<h2 style={styles.sectionTitle}>Request a Quote</h2>
				<div style={styles.quoteGrid}>
					<div>
						<p style={styles.small}>
							Tell us what you need done. In the next step we’ll
							add the ability to upload before photos and
							documents so quotes are faster and more accurate.
						</p>
						<ul style={{ ...styles.small, marginTop: 10 }}>
							<li>Include rooms / square footage (if known)</li>
							<li>
								Mention any repairs needed (patching, water
								stains, etc.)
							</li>
							<li>Share your timeline</li>
						</ul>
					</div>
					<QuoteForm />
				</div>
			</section>

			{/* REVIEWS (approved only) */}
			<ReviewsSection />
		</div>
	);
}
