import { Link, NavLink } from "react-router-dom";

const styles = {
	wrap: {
		borderBottom: "1px solid #eee",
		padding: "16px 24px",
		position: "sticky",
		top: 0,
		background: "white",
		zIndex: 10,
	},
	inner: {
		maxWidth: 1100,
		margin: "0 auto",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 16,
	},
	brand: {
		fontWeight: 800,
		letterSpacing: 0.2,
		textDecoration: "none",
		color: "#111",
	},
	links: { display: "flex", gap: 14 },
	link: ({ isActive }) => ({
		textDecoration: "none",
		color: isActive ? "#111" : "#555",
		fontWeight: isActive ? 700 : 500,
	}),
};

export default function Navbar() {
	return (
		<header style={styles.wrap}>
			<div style={styles.inner}>
				<Link to="/" style={styles.brand}>
					Manny's Painting Company
				</Link>
				<nav style={styles.links}>
					<NavLink to="/" style={styles.link} end>
						Home
					</NavLink>
					<NavLink to="/gallery" style={styles.link}>
						Gallery
					</NavLink>
				</nav>
			</div>
		</header>
	);
}
