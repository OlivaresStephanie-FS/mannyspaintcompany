import { NavLink, useNavigate } from "react-router-dom";
import { clearToken } from "../lib/adminAuth";
import styles from "./AdminNav.module.css";

export default function AdminNav() {
	const navigate = useNavigate();

	function handleLogout() {
		clearToken();
		navigate("/admin/login");
	}

	return (
		<div className={styles.wrap}>
			<div className={styles.left}>
				<NavLink
					to="/admin"
					end
					className={({ isActive }) =>
						`${styles.link} ${isActive ? styles.active : ""}`
					}>
					Quotes
				</NavLink>

				<NavLink
					to="/admin/reviews"
					className={({ isActive }) =>
						`${styles.link} ${isActive ? styles.active : ""}`
					}>
					Reviews
				</NavLink>

				<NavLink
					to="/admin/dashboard"
					className={({ isActive }) =>
						`${styles.link} ${isActive ? styles.active : ""}`
					}>
					Dashboard
				</NavLink>

				<NavLink
					to="/admin/activity"
					className={({ isActive }) =>
						`${styles.link} ${isActive ? styles.active : ""}`
					}>
					Activity
				</NavLink>
			</div>

			<button
				type="button"
				className={styles.logout}
				onClick={handleLogout}>
				Log out
			</button>
		</div>
	);
}
