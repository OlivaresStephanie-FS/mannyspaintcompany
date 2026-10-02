import { Link, NavLink } from "react-router-dom";
import logo from "../assets/Mannys_Painting_Logo_800px_Transparent.png";
import styles from "./Navbar.module.css";

export default function Navbar() {
	return (
		<header className={styles.wrap}>
			<div className={`container ${styles.inner}`}>
				<Link to="/" className={styles.brand}>
					<span className={styles.brandLogoClip}>
						<img
							src={logo}
							alt="Manny's Painting Company"
							className={styles.brandLogo}
							width={800}
							height={333}
						/>
					</span>
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
