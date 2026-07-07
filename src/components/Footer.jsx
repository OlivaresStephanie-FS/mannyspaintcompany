import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const PHONE_DISPLAY = "(917) 326-1720";
const PHONE_HREF = "tel:+19173261720";
const EMAIL = "manuelico11@gmail.com";

export default function Footer() {
	return (
		<footer className={styles.wrap}>
			<div className={`container ${styles.inner}`}>
				<div className={styles.grid}>
					<div className={styles.brandCol}>
						<div className={styles.title}>
							Manny&apos;s Painting Company
						</div>
						<p className={styles.tagline}>
							Proudly serving residential and commercial clients
							throughout New York City and the Tri-State area.
						</p>
						<p className={styles.trust}>
							Licensed &amp; Insured
						</p>
					</div>

					<div className={styles.col}>
						<div className={styles.colTitle}>Navigate</div>
						<nav className={styles.links} aria-label="Footer">
							<Link to="/">Home</Link>
							<Link to="/gallery">Gallery</Link>
							<Link to="/reviews">Reviews</Link>
							<a href="/#quote">Request Estimate</a>
						</nav>
					</div>

					<div className={styles.col}>
						<div className={styles.colTitle}>Contact</div>
						<div className={styles.contactList}>
							<a href={PHONE_HREF} className={styles.contactLink}>
								{PHONE_DISPLAY}
							</a>
							<a
								href={`mailto:${EMAIL}`}
								className={styles.contactLink}>
								{EMAIL}
							</a>
							<p className={styles.contactMeta}>
								Mon–Sat
								<br />
								New York City &amp; Tri-State Area
							</p>
						</div>
					</div>
				</div>

				<div className={styles.bottom}>
					<div className={styles.copy}>
						© {new Date().getFullYear()} SOLINYC LLC. All rights
						reserved.
					</div>
					<div className={styles.admin}>
						<Link to="/admin/login">Admin</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
