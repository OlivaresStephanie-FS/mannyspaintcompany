import ProjectCard from "../components/ProjectCard";
import styles from "./Gallery.module.css";

const projects = [
	{
		title: "Upper West Side Apartment Refresh",
		service: "Interior Painting",
		location: "NYC",
		description:
			"Patch + prep, two-coat finish, trim touch-ups for a crisp clean look.",
		beforeSrc:
			"https://images.unsplash.com/photo-1505691723518-36a5ac3b6f12?auto=format&fit=crop&w=1400&q=60",
		afterSrc:
			"https://images.unsplash.com/photo-1507089947369-19c1da9775ae?auto=format&fit=crop&w=1400&q=60",
	},
	{
		title: "Brooklyn Living Room Upgrade",
		service: "Repair + Repaint",
		location: "Brooklyn",
		description:
			"Crack repairs, smoothing, repaint, and baseboard refresh.",
		beforeSrc:
			"https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1400&q=60",
		afterSrc:
			"https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=60",
	},
	{
		title: "Door & Trim Finish Work",
		service: "Trim / Doors",
		location: "NJ",
		description:
			"Sanding, priming, and durable satin finish for high-touch surfaces.",
		beforeSrc:
			"https://images.unsplash.com/photo-1560448075-bb4caa6c0f4b?auto=format&fit=crop&w=1400&q=60",
		afterSrc:
			"https://images.unsplash.com/photo-1560185007-5f0bb1866cab?auto=format&fit=crop&w=1400&q=60",
	},
];

export default function Gallery() {
	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<h1 className={styles.h1}>Project Gallery</h1>
				<p className={styles.p}>
					A few before &amp; after examples. Tap the toggle on any card to switch views.
				</p>
			</header>

			<section className={styles.grid}>
				{projects.map((p) => (
					<ProjectCard key={p.title} {...p} />
				))}
			</section>
		</div>
	);
}