import { useState } from "react";
import styles from "./ProjectCard.module.css";

export default function ProjectCard({
	title,
	service,
	location,
	description,
	beforeSrc,
	afterSrc,
}) {
	const [view, setView] = useState("after");

	const src = view === "before" ? beforeSrc : afterSrc;

	return (
		<article className={styles.card}>
			<div className={styles.media}>
				<img
					src={src}
					alt={`${title} - ${view}`}
					className={styles.img}
					loading="lazy"
				/>

				<div className={styles.chipRow}>
					<button
						type="button"
						className={`${styles.chip} ${
							view === "before" ? styles.chipActive : ""
						}`}
						onClick={() => setView("before")}>
						Before
					</button>

					<button
						type="button"
						className={`${styles.chip} ${
							view === "after" ? styles.chipActive : ""
						}`}
						onClick={() => setView("after")}>
						After
					</button>
				</div>
			</div>

			<div className={styles.body}>
				<h3 className={styles.title}>{title}</h3>

				<p className={styles.meta}>
					{service}
					{location ? ` • ${location}` : ""}
				</p>

				<p className={styles.desc}>{description}</p>

				<div className={styles.linkRow}>
					<span className={styles.subtle}>
						Tap Before/After to toggle
					</span>
					<span className={styles.subtle}>
						{view === "before"
							? "Viewing: Before"
							: "Viewing: After"}
					</span>
				</div>
			</div>
		</article>
	);
}
