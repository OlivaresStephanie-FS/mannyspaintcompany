import { useState } from "react";

const styles = {
	card: {
		border: "1px solid #eee",
		borderRadius: 16,
		overflow: "hidden",
		background: "white",
	},
	media: {
		position: "relative",
		width: "100%",
		aspectRatio: "16 / 10",
		overflow: "hidden",
		background: "#f7f7f7",
	},
	img: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
		display: "block",
	},
	chipRow: {
		position: "absolute",
		inset: "12px 12px auto 12px",
		display: "flex",
		gap: 8,
	},
	chip: (active) => ({
		padding: "6px 10px",
		borderRadius: 999,
		fontSize: 12,
		fontWeight: 700,
		border: "1px solid #e6e6e6",
		background: active ? "#111" : "rgba(255,255,255,0.92)",
		color: active ? "white" : "#111",
		cursor: "pointer",
		userSelect: "none",
	}),
	body: {
		padding: 16,
		display: "grid",
		gap: 8,
	},
	title: {
		fontSize: 16,
		fontWeight: 800,
		color: "#111",
		margin: 0,
	},
	meta: {
		fontSize: 13,
		color: "#666",
		margin: 0,
	},
	desc: {
		fontSize: 14,
		color: "#333",
		lineHeight: 1.5,
		margin: 0,
	},
	linkRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 6,
	},
	subtle: {
		fontSize: 12,
		color: "#777",
	},
};

export default function ProjectCard({
	title,
	service,
	location,
	description,
	beforeSrc,
	afterSrc,
}) {
	const [view, setView] = useState("after"); // default to "after" (usually looks nicest)

	const src = view === "before" ? beforeSrc : afterSrc;

	return (
		<article style={styles.card}>
			<div style={styles.media}>
				<img
					src={src}
					alt={`${title} - ${view}`}
					style={styles.img}
					loading="lazy"
				/>

				<div style={styles.chipRow}>
					<div
						style={styles.chip(view === "before")}
						onClick={() => setView("before")}>
						Before
					</div>
					<div
						style={styles.chip(view === "after")}
						onClick={() => setView("after")}>
						After
					</div>
				</div>
			</div>

			<div style={styles.body}>
				<h3 style={styles.title}>{title}</h3>
				<p style={styles.meta}>
					{service}
					{location ? ` • ${location}` : ""}
				</p>
				<p style={styles.desc}>{description}</p>

				<div style={styles.linkRow}>
					<span style={styles.subtle}>
						Tap Before/After to toggle
					</span>
					<span style={styles.subtle}>
						{view === "before"
							? "Viewing: Before"
							: "Viewing: After"}
					</span>
				</div>
			</div>
		</article>
	);
}
