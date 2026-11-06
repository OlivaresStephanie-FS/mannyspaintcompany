import { useState } from "react";
import PhotoViewer from "./PhotoViewer";
import styles from "./ProjectCard.module.css";

export default function ProjectCard({
	title,
	service,
	location,
	description,
	beforeSrc,
	afterSrc,
	photos,
}) {
	const views =
		Array.isArray(photos) && photos.length > 0
			? photos
			: [
					{ id: "before", label: "Before", src: beforeSrc },
					{ id: "after", label: "After", src: afterSrc },
				];

	const coverIndex = Math.max(
		0,
		views.findIndex((photo) => photo.id === "after" || photo.src === afterSrc),
	);
	const cover = views[coverIndex];
	const [viewerOpen, setViewerOpen] = useState(false);
	const [viewerIndex, setViewerIndex] = useState(coverIndex);

	function openViewer() {
		setViewerIndex(coverIndex);
		setViewerOpen(true);
	}

	return (
		<article className={styles.card}>
			<div className={styles.media}>
				<button
					type="button"
					className={styles.photoButton}
					onClick={openViewer}
					aria-label={`View larger photo: ${title} — finished result`}>
					<img
						src={cover.src}
						alt=""
						className={styles.img}
						loading="lazy"
					/>
				</button>
			</div>

			<div className={styles.body}>
				<h3 className={styles.title}>{title}</h3>

				<p className={styles.meta}>
					{service}
					{location ? ` • ${location}` : ""}
				</p>

				<p className={styles.desc}>{description}</p>
			</div>

			{viewerOpen ? (
				<PhotoViewer
					title={title}
					photos={views}
					index={viewerIndex}
					onIndexChange={setViewerIndex}
					onClose={() => setViewerOpen(false)}
				/>
			) : null}
		</article>
	);
}
