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
					Explore our painting and renovation projects. Select a photo to see the work from different stages and angles.
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