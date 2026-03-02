import { useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

export default function Review() {
	const { quoteId } = useParams();
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") || "";

	const [rating, setRating] = useState(0);
	const [text, setText] = useState("");
	const [name, setName] = useState("");

	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState("idle"); // idle | success | error
	const [message, setMessage] = useState("");

	const payload = useMemo(
		() => ({
			quoteId,
			token,
			rating,
			text,
			name,
		}),
		[quoteId, token, rating, text, name],
	);

	async function submit(e) {
		e.preventDefault();

		if (!token || !quoteId) {
			setStatus("error");
			setMessage("Invalid review link.");
			return;
		}

		if (!rating) {
			setStatus("error");
			setMessage("Please choose a star rating.");
			return;
		}

		setLoading(true);
		setStatus("idle");
		setMessage("");

		try {
			const res = await fetch(
				"/.netlify/functions/public-submit-review",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				},
			);

			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				setStatus("error");
				setMessage(data.error || "Something went wrong.");
			} else {
				setStatus("success");
				setMessage(
					"Thank you! Your review was submitted for approval.",
				);
			}
		} catch (err) {
			setStatus("error");
			setMessage("Network/server error. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	// Basic link validation UI
	if (!quoteId || quoteId.length !== 24) {
		return (
			<div style={styles.wrap}>
				<h2 style={styles.h2}>Invalid review link</h2>
				<p style={styles.p}>The link is missing a valid quote ID.</p>
				<Link to="/" style={styles.link}>
					Return home
				</Link>
			</div>
		);
	}

	if (!token) {
		return (
			<div style={styles.wrap}>
				<h2 style={styles.h2}>Invalid review link</h2>
				<p style={styles.p}>This link is missing a token.</p>
				<Link to="/" style={styles.link}>
					Return home
				</Link>
			</div>
		);
	}

	if (status === "success") {
		return (
			<div style={styles.wrap}>
				<h2 style={styles.h2}>Thank you! ⭐</h2>
				<p style={styles.p}>{message}</p>
				<Link to="/" style={styles.link}>
					Return home
				</Link>
			</div>
		);
	}

	return (
		<div style={styles.wrap}>
			<h2 style={styles.h2}>Leave a Review ⭐</h2>
			<p style={styles.p}>
				We appreciate your feedback — it helps Manny’s Painting Company
				grow.
			</p>

			<form onSubmit={submit} style={styles.form}>
				<div style={styles.section}>
					<div style={styles.label}>Your rating</div>

					{/* ⭐ STAR RATING */}
					<div style={styles.starsRow} aria-label="Star rating">
						{[1, 2, 3, 4, 5].map((n) => (
							<button
								key={n}
								type="button"
								onClick={() => setRating(n)}
								style={{
									...styles.starBtn,
									color: n <= rating ? "#f5b301" : "#cfcfcf",
								}}
								aria-label={`${n} star`}>
								★
							</button>
						))}
					</div>
				</div>

				<div style={styles.section}>
					<label style={styles.label} htmlFor="reviewText">
						Your review (optional)
					</label>
					<textarea
						id="reviewText"
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Tell us how it went…"
						style={styles.textarea}
						maxLength={2000}
					/>
					<div style={styles.hint}>{text.length}/2000</div>
				</div>

				<div style={styles.section}>
					<label style={styles.label} htmlFor="reviewName">
						Your name (optional)
					</label>
					<input
						id="reviewName"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g., Stephanie"
						style={styles.input}
						maxLength={80}
					/>
				</div>

				{/* optional honeypot field (should stay empty) */}
				<input
					type="text"
					name="website"
					tabIndex="-1"
					autoComplete="off"
					style={styles.honeypot}
					value=""
					readOnly
				/>

				{status === "error" && (
					<div style={styles.errorBox}>{message}</div>
				)}

				<button type="submit" disabled={loading} style={styles.submit}>
					{loading ? "Submitting…" : "Submit Review"}
				</button>

				<div style={styles.small}>
					This link expires automatically (30 days).
				</div>
			</form>
		</div>
	);
}

const styles = {
	wrap: {
		maxWidth: 520,
		margin: "64px auto",
		padding: "0 18px",
	},
	h2: {
		margin: "0 0 10px",
		fontSize: 28,
	},
	p: {
		margin: "0 0 18px",
		color: "#444",
		lineHeight: 1.5,
	},
	form: {
		border: "1px solid #eee",
		borderRadius: 14,
		padding: 18,
		background: "#fff",
		display: "grid",
		gap: 16,
	},
	section: {
		display: "grid",
		gap: 8,
	},
	label: {
		fontWeight: 700,
	},
	starsRow: {
		display: "flex",
		gap: 8,
		alignItems: "center",
	},
	// IMPORTANT: "all: unset" prevents global button styles from hiding the star
	starBtn: {
		all: "unset",
		cursor: "pointer",
		fontSize: 34,
		lineHeight: "34px",
		padding: 0,
		userSelect: "none",
	},
	textarea: {
		minHeight: 110,
		padding: 12,
		borderRadius: 10,
		border: "1px solid #ddd",
		fontFamily: "inherit",
		fontSize: 14,
		resize: "vertical",
	},
	input: {
		padding: 12,
		borderRadius: 10,
		border: "1px solid #ddd",
		fontFamily: "inherit",
		fontSize: 14,
	},
	hint: {
		fontSize: 12,
		color: "#666",
		textAlign: "right",
	},
	errorBox: {
		background: "#ffe9e9",
		border: "1px solid #ffb6b6",
		color: "#7a0000",
		padding: 10,
		borderRadius: 10,
	},
	submit: {
		padding: "12px 14px",
		borderRadius: 10,
		border: "none",
		background: "#111",
		color: "#fff",
		cursor: "pointer",
		fontWeight: 700,
	},
	small: {
		fontSize: 12,
		color: "#666",
		textAlign: "center",
		marginTop: 4,
	},
	link: {
		display: "inline-block",
		marginTop: 8,
		color: "#111",
		textDecoration: "underline",
	},
	honeypot: {
		position: "absolute",
		left: "-9999px",
		height: 0,
		width: 0,
		opacity: 0,
	},
};
