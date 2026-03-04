import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../lib/adminAuth";
import styles from "./AdminLogin.module.css";

export default function AdminLogin() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	async function handleLogin(e) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/.netlify/functions/admin-login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.error || "Login failed");
			if (!data.token) throw new Error("Missing token");

			setToken(data.token);
			navigate("/admin/reviews");
		} catch (err) {
			setError(err?.message || "Login failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<h2 className={styles.h2}>Admin Login</h2>

				<form className={styles.form} onSubmit={handleLogin}>
					<input
						className={styles.input}
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						autoComplete="username"
						required
					/>

					<input
						className={styles.input}
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoComplete="current-password"
						required
					/>

					<button
						className={styles.btn}
						type="submit"
						disabled={loading}>
						{loading ? "Signing in..." : "Login"}
					</button>
				</form>

				{error && <div className={styles.error}>{error}</div>}
			</div>
		</div>
	);
}
