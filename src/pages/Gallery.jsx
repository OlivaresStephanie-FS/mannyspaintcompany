import ProjectCard from "../components/ProjectCard";
import { galleryProjects } from "../data/galleryProjects";
import styles from "./Gallery.module.css";

const projects = galleryProjects;

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