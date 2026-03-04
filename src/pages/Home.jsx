import { useEffect, useState } from "react";
import QuoteForm from "../components/QuoteForm";
import styles from "./Home.module.css";

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
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Customer Reviews</h2>

			<div className={styles.reviewsGrid}>
				{items.map((r) => (
					<div
						key={r._id || `${r.submittedAt}-${Math.random()}`}
						className={styles.reviewCard}>
						<Stars n={r.rating} />
						<p className={styles.reviewText}>
							{r.text ? (
								r.text
							) : (
								<span className={styles.reviewEmpty}>
									(No comment)
								</span>
							)}
						</p>
						<div className={styles.reviewMeta}>
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
		<div className={styles.page}>
			{/* HERO */}
			<section className={styles.hero}>
				<div>
					<h1 className={styles.h1}>
						High-quality painting &amp; renovation work—done clean.
					</h1>
					<p className={styles.p}>
						Interior painting, patching, trim, doors, and refresh
						projects. Share a few details and photos and we’ll send
						a fast quote.
					</p>

					<div className={styles.ctas}>
						<button
							className={styles.btnPrimary}
							onClick={scrollToQuote}>
							Request a Quote
						</button>
						<a className={styles.btnGhost} href="/gallery">
							View Gallery
						</a>
					</div>

					<p className={`${styles.small} ${styles.heroNote}`}>
						Serving NYC / NJ • Flexible scheduling • Clear scope
						&amp; pricing
					</p>
				</div>

				<div>
					<div className={`${styles.card} ${styles.contactCard}`}>
						<div className={styles.cardTitleStrong}>
							Quick Contact
						</div>
						<div className={styles.small}>
							Phone: (917) 326-1720 <br />
							Email: manuelico11@gmail.com <br />
							Hours: Mon–Sat
						</div>
						<div
							className={`${styles.small} ${styles.contactHint}`}>
							Replace these placeholders with your real business
							info.
						</div>
					</div>
				</div>
			</section>

			{/* SERVICES */}
			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Services</h2>

				<div className={styles.services}>
					<div className={styles.card}>
						<p className={styles.cardTitle}>Interior Painting</p>
						<p className={styles.cardText}>
							Walls, ceilings, closets, and crisp cut-lines.
						</p>
					</div>

					<div className={styles.card}>
						<p className={styles.cardTitle}>
							Patching &amp; Repair
						</p>
						<p className={styles.cardText}>
							Holes, cracks, water stains, smoothing &amp; prep.
						</p>
					</div>

					<div className={styles.card}>
						<p className={styles.cardTitle}>
							Trim, Doors &amp; Baseboards
						</p>
						<p className={styles.cardText}>
							Sanding, priming, and durable finishes.
						</p>
					</div>
				</div>
			</section>

			{/* QUOTE */}
			<section id="quote" className={styles.section}>
				<h2 className={styles.sectionTitle}>Request a Quote</h2>

				<div className={styles.quoteGrid}>
					<div>
						<p className={styles.small}>
							Tell us what you need done. In the next step we’ll
							add the ability to upload before photos and
							documents so quotes are faster and more accurate.
						</p>
						<ul className={`${styles.small} ${styles.bullets}`}>
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
