import { useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import styles from "./ReviewsSubmit.module.css";

export default function ReviewsSubmit() {
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
			const res = await fetch("/.netlify/functions/public-submit-review", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				setStatus("error");
				setMessage(data.error || "Something went wrong.");
			} else {
				setStatus("success");
				setMessage("Thank you! Your review was submitted for approval.");
			}
		} catch {
			setStatus("error");
			setMessage("Network/server error. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	// Basic link validation UI
	if (!quoteId || quoteId.length !== 24) {
		return (
			<div className={styles.wrap}>
				<h2 className={styles.h2}>Invalid review link</h2>
				<p className={styles.p}>The link is missing a valid quote ID.</p>
				<Link to="/" className={styles.link}>
					Return home
				</Link>
			</div>
		);
	}

	if (!token) {
		return (
			<div className={styles.wrap}>
				<h2 className={styles.h2}>Invalid review link</h2>
				<p className={styles.p}>This link is missing a token.</p>
				<Link to="/" className={styles.link}>
					Return home
				</Link>
			</div>
		);
	}

	if (status === "success") {
		return (
			<div className={styles.wrap}>
				<h2 className={styles.h2}>Thank you! ⭐</h2>
				<p className={styles.p}>{message}</p>
				<Link to="/" className={styles.link}>
					Return home
				</Link>
			</div>
		);
	}

	return (
		<div className={styles.wrap}>
			<h2 className={styles.h2}>Leave a Review ⭐</h2>
			<p className={styles.p}>
				We appreciate your feedback — it helps Manny’s Painting Company grow.
			</p>

			<form onSubmit={submit} className={styles.form}>
				<div className={styles.section}>
					<div className={styles.label}>Your rating</div>

					<div className={styles.starsRow} aria-label="Star rating">
						{[1, 2, 3, 4, 5].map((n) => (
							<button
								key={n}
								type="button"
								onClick={() => setRating(n)}
								className={styles.starBtn}
								style={{ color: n <= rating ? "#f5b301" : "#cfcfcf" }}
								aria-label={`${n} star`}
							>
								★
							</button>
						))}
					</div>
				</div>

				<div className={styles.section}>
					<label className={styles.label} htmlFor="reviewText">
						Your review (optional)
					</label>
					<textarea
						id="reviewText"
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Tell us how it went…"
						className={styles.textarea}
						maxLength={2000}
					/>
					<div className={styles.hint}>{text.length}/2000</div>
				</div>

				<div className={styles.section}>
					<label className={styles.label} htmlFor="reviewName">
						Your name (optional)
					</label>
					<input
						id="reviewName"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g., Stephanie"
						className={styles.input}
						maxLength={80}
					/>
				</div>

				<input
					type="text"
					name="website"
					tabIndex="-1"
					autoComplete="off"
					className={styles.honeypot}
					value=""
					readOnly
				/>

				{status === "error" && <div className={styles.errorBox}>{message}</div>}

				<button type="submit" disabled={loading} className={styles.submit}>
					{loading ? "Submitting…" : "Submit Review"}
				</button>

				<div className={styles.small}>
					This link expires automatically (30 days).
				</div>
			</form>
		</div>
	);
}