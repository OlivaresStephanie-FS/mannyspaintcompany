import { Link, NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
	return (
		<header className={styles.wrap}>
			<div className={`container ${styles.inner}`}>
				<Link to="/" className={styles.brand}>
					Manny&apos;s Painting Company
				</Link>

				<nav className={styles.links}>
					<NavLink
						to="/"
						end
						className={({ isActive }) =>
							`${styles.link} ${isActive ? styles.active : ""}`
						}
					>
						Home
					</NavLink>

					<NavLink
						to="/gallery"
						className={({ isActive }) =>
							`${styles.link} ${isActive ? styles.active : ""}`
						}
					>
						Gallery
					</NavLink>

					<NavLink
						to="/reviews"
						className={({ isActive }) =>
							`${styles.link} ${isActive ? styles.active : ""}`
						}
					>
						Reviews
					</NavLink>
				</nav>
			</div>
		</header>
	);
}