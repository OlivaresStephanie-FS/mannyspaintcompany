import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, clearToken } from "../lib/adminAuth";
import AdminNav from "../components/AdminNav";
import styles from "./AdminDashboard.module.css";

function percent(value, total) {
	if (!total) return 0;
	return Math.round((value / total) * 100);
}

export default function AdminDashboard() {
	const navigate = useNavigate();

	const [metrics, setMetrics] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const t = String(getToken() || "").trim();
		if (!t) navigate("/admin/login");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function load() {
		setLoading(true);
		setError("");

		try {
			const t = String(getToken() || "").trim();
			if (!t) {
				clearToken();
				navigate("/admin/login");
				return;
			}

			const res = await fetch("/.netlify/functions/admin-dashboard", {
				headers: { Authorization: `Bearer ${t}` },
			});

			if (res.status === 401) {
				clearToken();
				navigate("/admin/login");
				return;
			}

			const data = await res.json().catch(() => ({}));
			if (!res.ok || !data.ok) {
				throw new Error(data?.error || "Failed to load dashboard");
			}

			setMetrics(data.metrics || {});
		} catch (e) {
			setError(e?.message || "Error loading dashboard");
			setMetrics(null);
		} finally {
			setLoading(false);
		}
	}

	const totalQuotes = metrics?.totalQuotes ?? 0;
	const totalReviews =
		(metrics?.pendingReviews ?? 0) +
		(metrics?.approvedReviews ?? 0) +
		(metrics?.rejectedReviews ?? 0);

	const quoteStatuses = useMemo(
		() => [
			{ key: "new", label: "New", value: metrics?.newQuotes ?? 0 },
			{
				key: "contacted",
				label: "Contacted",
				value: metrics?.contactedQuotes ?? 0,
			},
			{
				key: "scheduled",
				label: "Scheduled",
				value: metrics?.scheduledQuotes ?? 0,
			},
			{
				key: "completed",
				label: "Completed",
				value: metrics?.completedQuotes ?? 0,
			},
			{
				key: "archived",
				label: "Archived",
				value: metrics?.archivedQuotes ?? 0,
			},
		],
		[metrics],
	);

	const reviewStatuses = useMemo(
		() => [
			{
				key: "pending",
				label: "Pending Reviews",
				value: metrics?.pendingReviews ?? 0,
			},
			{
				key: "approved",
				label: "Approved Reviews",
				value: metrics?.approvedReviews ?? 0,
			},
			{
				key: "rejected",
				label: "Rejected Reviews",
				value: metrics?.rejectedReviews ?? 0,
			},
		],
		[metrics],
	);

	const completionRate = percent(metrics?.completedQuotes ?? 0, totalQuotes);
	const approvalRate = percent(metrics?.approvedReviews ?? 0, totalReviews);

	const recentActivity = [
		{
			label: "Quotes in last 7 days",
			value: metrics?.quotesLast7Days ?? 0,
		},
		{
			label: "Quotes in last 30 days",
			value: metrics?.quotesLast30Days ?? 0,
		},
		{
			label: "Completed in last 30 days",
			value: metrics?.completedQuotesLast30Days ?? 0,
		},
		{
			label: "Reviews in last 30 days",
			value: metrics?.reviewsLast30Days ?? 0,
		},
		{
			label: "Approved reviews in last 30 days",
			value: metrics?.approvedReviewsLast30Days ?? 0,
		},
	];

	return (
		<div className={styles.page}>
			<AdminNav />

			<div className={styles.headerRow}>
				<div>
					<h1 className={styles.h1}>Dashboard</h1>
					<p className={styles.subhead}>
						A quick overview of quotes and reviews.
					</p>
				</div>

				<button
					type="button"
					className={styles.refreshBtn}
					onClick={load}
					disabled={loading}>
					{loading ? "Loading..." : "Refresh"}
				</button>
			</div>

			{error ? <div className={styles.err}>{error}</div> : null}

			<div className={styles.grid}>
				<div className={styles.card}>
					<div className={styles.cardLabel}>Total Quotes</div>
					<div className={styles.cardValue}>
						{metrics?.totalQuotes ?? 0}
					</div>
				</div>

				<div className={styles.card}>
					<div className={styles.cardLabel}>Pending Reviews</div>
					<div className={styles.cardValue}>
						{metrics?.pendingReviews ?? 0}
					</div>
				</div>

				<div className={styles.card}>
					<div className={styles.cardLabel}>Approved Reviews</div>
					<div className={styles.cardValue}>
						{metrics?.approvedReviews ?? 0}
					</div>
				</div>

				<div className={styles.card}>
					<div className={styles.cardLabel}>Completed Quotes</div>
					<div className={styles.cardValue}>
						{metrics?.completedQuotes ?? 0}
					</div>
				</div>
			</div>

			<div className={styles.snapshotGrid}>
				<div className={styles.snapshotCard}>
					<div className={styles.snapshotLabel}>
						Quote Completion Rate
					</div>
					<div className={styles.snapshotValue}>
						{completionRate}%
					</div>
					<div className={styles.snapshotSub}>
						Completed out of all submitted quotes
					</div>
				</div>

				<div className={styles.snapshotCard}>
					<div className={styles.snapshotLabel}>
						Review Approval Rate
					</div>
					<div className={styles.snapshotValue}>{approvalRate}%</div>
					<div className={styles.snapshotSub}>
						Approved out of all submitted reviews
					</div>
				</div>
			</div>

			<div className={styles.twoCol}>
				<section className={styles.panel}>
					<h2 className={styles.h2}>Quote Status</h2>

					<div className={styles.chartList}>
						{quoteStatuses.map((item) => {
							const width = percent(item.value, totalQuotes);

							return (
								<div
									key={item.label}
									className={styles.chartRow}>
									<div className={styles.chartMeta}>
										<span className={styles.statLabel}>
											{item.label}
										</span>
										<span className={styles.statValue}>
											{item.value}
										</span>
									</div>

									<div className={styles.track}>
										<div
											className={`${styles.fill} ${styles[item.key]}`}
											style={{ width: `${width}%` }}
										/>
									</div>

									<div className={styles.percentText}>
										{width}%
									</div>
								</div>
							);
						})}
					</div>
				</section>

				<section className={styles.panel}>
					<h2 className={styles.h2}>Review Status</h2>

					<div className={styles.chartList}>
						{reviewStatuses.map((item) => {
							const width = percent(item.value, totalReviews);

							return (
								<div
									key={item.label}
									className={styles.chartRow}>
									<div className={styles.chartMeta}>
										<span className={styles.statLabel}>
											{item.label}
										</span>
										<span className={styles.statValue}>
											{item.value}
										</span>
									</div>

									<div className={styles.track}>
										<div
											className={`${styles.fill} ${styles[item.key]}`}
											style={{ width: `${width}%` }}
										/>
									</div>

									<div className={styles.percentText}>
										{width}%
									</div>
								</div>
							);
						})}
					</div>
				</section>
			</div>

			<section className={styles.panelWide}>
				<h2 className={styles.h2}>Recent Activity</h2>

				<div className={styles.statsList}>
					{recentActivity.map((item) => (
						<div key={item.label} className={styles.statRow}>
							<span className={styles.statLabel}>
								{item.label}
							</span>
							<span className={styles.statValue}>
								{item.value}
							</span>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
