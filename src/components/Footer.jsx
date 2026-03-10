import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
	return (
		<footer className={styles.wrap}>
			<div className={`container ${styles.inner}`}>
				<div className={styles.title}>
					Manny&apos;s Painting Company
				</div>
				<div className={styles.line}>
					Serving NYC / NJ • Licensed & Insured
				</div>
				<div className={styles.copy}>
					© {new Date().getFullYear()} Soli.NYC All rights reserved.
				</div>
				<div className={styles.admin}>
					<Link to="/admin/login">Admin</Link>
				</div>
			</div>
		</footer>
	);
}
