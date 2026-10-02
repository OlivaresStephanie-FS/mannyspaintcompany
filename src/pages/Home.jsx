import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QuoteForm from "../components/QuoteForm";
import ServiceIcon from "../components/ServiceIcon";
import {
	galleryProjects,
	GALLERY_USES_PLACEHOLDER_IMAGES,
} from "../data/galleryProjects";
import styles from "./Home.module.css";

const TRUST_BADGES = [
	"Free On-Site Estimates",
	"Fully Insured",
	"NYC & Tri-State Area",
	"Residential & Commercial",
];

const SERVICES = [
	{
		title: "Interior Painting",
		desc: "Walls, ceilings, closets, and trim refreshed with thorough prep, sharp cut-lines, and clean finishes—whether it is one room or an entire home.",
		icon: "interior",
	},
	{
		title: "Exterior Painting",
		desc: "Facades, stoops, railings, and exterior trim restored with proper surface prep and durable coatings built for New York and New Jersey weather.",
		icon: "exterior",
	},
	{
		title: "Drywall & Plaster Repair",
		desc: "Holes, cracks, water stains, and uneven surfaces patched, skim-coated, and sanded smooth so paint goes on flawlessly and stays that way.",
		icon: "repair",
	},
	{
		title: "Trim, Doors & Baseboards",
		desc: "Doors, baseboards, crown, and millwork carefully sanded, caulked, primed, and finished for a crisp, long-lasting look in high-traffic areas.",
		icon: "trim",
	},
	{
		title: "Cabinet Painting",
		desc: "Kitchen and bathroom cabinets professionally cleaned, prepped, and refinished—updated style and protection without the cost of full replacement.",
		icon: "cabinet",
	},
	{
		title: "Apartment Turnovers",
		desc: "Reliable turnover painting for landlords, property managers, and agents—consistent quality, clear scheduling, and units ready for the next tenant.",
		icon: "turnover",
	},
];

const WHY_CHOOSE = [
	{
		title: "Clean Work",
		desc: "Floors covered, furniture protected, and job sites kept tidy from the first coat through the final walkthrough.",
	},
	{
		title: "Honest Pricing",
		desc: "Straightforward quotes with clear scope—no surprises, and no pressure to move forward until you are ready.",
	},
	{
		title: "Careful Prep",
		desc: "Patching, sanding, priming, and caulking done the right way, because lasting results start before the first coat of paint.",
	},
	{
		title: "Reliable Scheduling",
		desc: "We arrive on time, stay in touch throughout the project, and respect your schedule and your space.",
	},
];

const CONTACT_HIGHLIGHTS = [
	"Free estimates—on-site or from photos",
	"Interior, exterior, repair, and turnover work",
	"Fully insured and family-owned",
];

const REVIEW_SKELETON_COUNT = 3;

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

function ReviewSkeleton() {
	return (
		<div className={styles.reviewSkeleton} aria-hidden="true">
			<div className={styles.skeletonLine} style={{ width: "40%" }} />
			<div className={styles.skeletonLine} />
			<div className={styles.skeletonLine} />
			<div
				className={styles.skeletonLine}
				style={{ width: "55%", marginTop: 12 }}
			/>
		</div>
	);
}

function RecentProjectsSection() {
	const preview = galleryProjects.slice(0, 3);

	return (
		<section className={styles.section}>
			<div className={styles.sectionHeader}>
				<p className={styles.sectionEyebrow}>Our Work</p>
				<h2 className={styles.sectionTitle}>Recent Projects</h2>
				<p className={styles.sectionLead}>
					Projects completed throughout New York City and the
					Tri-State area.
				</p>
			</div>

			{GALLERY_USES_PLACEHOLDER_IMAGES ? (
				<div className={styles.placeholderBanner} role="note">
					<strong>Layout preview:</strong> Sample photos are shown
					below. This section is ready for real Manny&apos;s Painting
					Company project images.
				</div>
			) : null}

			<div className={styles.projectsGrid}>
				{preview.map((project) => (
					<article
						key={project.title}
						className={styles.projectPreview}>
						<div className={styles.projectMedia}>
							<img
								src={project.afterSrc}
								alt={`${project.title} — finished result`}
								className={styles.projectImg}
								loading="lazy"
							/>
							{GALLERY_USES_PLACEHOLDER_IMAGES ? (
								<span className={styles.sampleBadge}>
									Sample photo
								</span>
							) : null}
						</div>
						<div className={styles.projectBody}>
							<h3 className={styles.projectTitle}>
								{project.title}
							</h3>
							<p className={styles.projectMeta}>
								{project.service}
								{project.location
									? ` • ${project.location}`
									: ""}
							</p>
							<p className={styles.projectDesc}>
								{project.description}
							</p>
						</div>
					</article>
				))}
			</div>

			<div className={styles.projectsCta}>
				<Link to="/gallery" className={styles.btnSecondary}>
					View Full Gallery
				</Link>
			</div>
		</section>
	);
}

function ReviewsSection({ onRequestQuote }) {
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
				if (alive) setLoading(false);
			}
		})();

		return () => {
			alive = false;
		};
	}, []);

	return (
		<section
			className={`${styles.section} ${styles.reviewsSection}`}
			aria-busy={loading}>
			<div className={styles.sectionHeader}>
				<p className={styles.sectionEyebrow}>What Clients Say</p>
				<h2 className={styles.sectionTitle}>Customer Reviews</h2>
				<p className={styles.sectionLead}>
					Feedback from homeowners and property managers we have
					worked with throughout NYC and the Tri-State area.
				</p>
			</div>

			{loading ? (
				<div
					className={styles.reviewsGrid}
					aria-label="Loading reviews">
					{Array.from({ length: REVIEW_SKELETON_COUNT }, (_, i) => (
						<ReviewSkeleton key={i} />
					))}
				</div>
			) : null}

			{!loading && items.length === 0 ? (
				<div className={styles.reviewsEmpty}>
					<p className={styles.reviewsEmptyTitle}>
						Reviews are on the way
					</p>
					<p className={styles.reviewsEmptyText}>
						We take pride in the work we do for our clients. As
						reviews are submitted and approved, they will appear
						here and on our reviews page.
					</p>
					<div className={styles.reviewsEmptyActions}>
						<Link to="/reviews" className={styles.btnSecondary}>
							Visit Reviews Page
						</Link>
						<button
							type="button"
							className={styles.btnPrimaryDark}
							onClick={onRequestQuote}>
							Get Your Free Estimate
						</button>
					</div>
				</div>
			) : null}

			{!loading && items.length > 0 ? (
				<>
					<div className={styles.reviewsGrid}>
						{items.map((r, index) => (
							<div
								key={
									r._id ||
									`${r.submittedAt || "review"}-${index}`
								}
								className={styles.reviewCard}>
								<Stars n={r.rating} />
								<p className={styles.reviewText}>
									{r.text ? (
										r.text
									) : (
										<span className={styles.reviewEmpty}>
											Left a rating without written
											feedback.
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
					<div className={styles.reviewsFooter}>
						<Link to="/reviews" className={styles.textLink}>
							View all reviews →
						</Link>
					</div>
				</>
			) : null}
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
				<div className={styles.heroContent}>
					<p className={styles.heroEyebrow}>
						Family-Owned • Serving NYC &amp; the Tri-State Area
					</p>
					<h1 className={styles.h1}>
						Quality painting and finish work—done right, done clean.
					</h1>
					<p className={styles.p}>
						Manny&apos;s Painting Company is a family-owned
						contractor trusted for careful prep, clear
						communication, and finishes that hold up. Serving
						homeowners, property managers, and businesses
						throughout New York City and the Tri-State area.
					</p>

					<div className={styles.ctas}>
						<button
							type="button"
							className={styles.btnPrimary}
							onClick={scrollToQuote}>
							Get Your Free Estimate
						</button>
						<a className={styles.btnGhost} href="/gallery">
							See Our Projects
						</a>
					</div>

					<div className={styles.trustBadges}>
						{TRUST_BADGES.map((badge) => (
							<span key={badge} className={styles.trustBadge}>
								{badge}
							</span>
						))}
					</div>
				</div>

				<aside className={styles.heroAside}>
					<div className={`${styles.card} ${styles.contactCard}`}>
						<div className={styles.ratingBlock}>
							<div className={styles.ratingLabel}>
								Locally Trusted Painter
							</div>
							<p className={styles.ratingSubline}>
								Trusted by homeowners and property managers in
								New York City and the Tri-State area.
							</p>
						</div>

						<div className={styles.contactDivider} />

						<a
							className={styles.phoneLink}
							href="tel:+19173261720">
							<span className={styles.phoneLabel}>Call or text</span>
							<span className={styles.phoneNumber}>
								(917) 326-1720
							</span>
						</a>

						<a
							className={styles.emailLink}
							href="mailto:manuelico11@gmail.com">
							<span className={styles.phoneLabel}>Email us</span>
							<span className={styles.emailAddress}>
								manuelico11@gmail.com
							</span>
						</a>

						<div className={styles.contactRow}>
							<span className={styles.contactRowLabel}>
								Service area
							</span>
							<span className={styles.contactRowValue}>
								New York City &amp; Tri-State Area
							</span>
						</div>

						<div className={styles.contactRow}>
							<span className={styles.contactRowLabel}>Hours</span>
							<span className={styles.contactRowValue}>
								Mon–Sat
							</span>
						</div>

						<ul className={styles.highlightList}>
							{CONTACT_HIGHLIGHTS.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>
				</aside>
			</section>

			{/* SERVICES */}
			<section className={`${styles.section} ${styles.sectionWarm}`}>
				<div className={styles.sectionHeader}>
					<p className={styles.sectionEyebrow}>What We Do</p>
					<h2 className={styles.sectionTitle}>Our Services</h2>
					<p className={styles.sectionLead}>
						From a single-room refresh to a full building turnover,
						we handle prep, paint, and finish work with the same
						attention to detail on every job.
					</p>
				</div>

				<div className={styles.services}>
					{SERVICES.map((service) => (
						<div key={service.title} className={styles.serviceCard}>
							<div className={styles.serviceCardHeader}>
								<span className={styles.serviceIcon}>
									<ServiceIcon name={service.icon} />
								</span>
								<h3 className={styles.cardTitle}>
									{service.title}
								</h3>
							</div>
							<p className={styles.cardText}>{service.desc}</p>
						</div>
					))}
				</div>
			</section>

			<RecentProjectsSection />

			{/* WHY CHOOSE */}
			<section className={styles.section}>
				<div className={styles.sectionHeader}>
					<p className={styles.sectionEyebrow}>The Manny&apos;s Difference</p>
					<h2 className={styles.sectionTitle}>
						Why Choose Manny&apos;s Painting
					</h2>
					<p className={styles.sectionLead}>
						A family-owned crew that treats your property with care
						and leaves every project looking sharp, clean, and
						professionally finished.
					</p>
				</div>

				<div className={styles.whyGrid}>
					{WHY_CHOOSE.map((item) => (
						<div key={item.title} className={styles.whyCard}>
							<div className={styles.whyAccent} aria-hidden />
							<h3 className={styles.whyTitle}>{item.title}</h3>
							<p className={styles.whyText}>{item.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* QUOTE */}
			<section
				id="quote"
				className={`${styles.section} ${styles.quoteSection}`}>
				<div className={styles.sectionHeader}>
					<p className={styles.sectionEyebrow}>Get Started</p>
					<h2 className={styles.sectionTitle}>Request a Free Estimate</h2>
					<p className={styles.sectionLead}>
						Share a few details about your project and we&apos;ll
						follow up with a clear quote—most requests are answered
						within one business day.
					</p>
				</div>

				<div className={styles.quoteGrid}>
					<div className={styles.quoteAside}>
						<p className={styles.quoteIntro}>
							The more we know upfront, the faster we can provide
							an accurate estimate. Before photos are especially
							helpful for repair, prep, and color-change projects.
						</p>
						<ul className={styles.bullets}>
							<li>
								Rooms affected, approximate square footage, or
								overall scope of work
							</li>
							<li>
								Any repairs needed—patching, water stains,
								cracks, or peeling paint
							</li>
							<li>
								Your preferred start date, timeline, and any
								access restrictions
							</li>
							<li>
								Upload before photos or floor plans for a faster,
								more precise quote
							</li>
						</ul>
						<p className={styles.quoteNote}>
							There is no obligation. We&apos;ll review your
							project, explain your options, and confirm pricing
							before any work begins.
						</p>
					</div>

					<QuoteForm />
				</div>
			</section>

			<ReviewsSection onRequestQuote={scrollToQuote} />
		</div>
	);
}
