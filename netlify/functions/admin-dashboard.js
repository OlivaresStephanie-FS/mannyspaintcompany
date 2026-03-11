import { getDb } from "./_db.js";
import jwt from "jsonwebtoken";

function json(statusCode, body) {
	return {
		statusCode,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "no-store",
		},
		body: JSON.stringify(body),
	};
}

function isValidBearer(event) {
	const auth =
		event.headers?.authorization || event.headers?.Authorization || "";

	if (!auth.startsWith("Bearer ")) return false;

	const token = auth.slice("Bearer ".length).trim();
	if (!token) return false;

	const secret = process.env.ADMIN_JWT_SECRET;
	if (!secret) return false;

	try {
		jwt.verify(token, secret);
		return true;
	} catch {
		return false;
	}
}

function daysAgoDate(days) {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() - days);
	return d;
}

function round(value, digits = 1) {
	const n = Number(value || 0);
	if (!Number.isFinite(n)) return 0;
	const factor = 10 ** digits;
	return Math.round(n * factor) / factor;
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "GET") {
			return json(405, {
				ok: false,
				error: "Method Not Allowed",
			});
		}

		if (!isValidBearer(event)) {
			return json(401, {
				ok: false,
				error: "Unauthorized",
			});
		}

		const db = await getDb();
		const quotes = db.collection("quotes");
		const reviews = db.collection("reviews");

		const sevenDaysAgo = daysAgoDate(7);
		const thirtyDaysAgo = daysAgoDate(30);

		const [
			totalQuotes,
			newQuotes,
			contactedQuotes,
			scheduledQuotes,
			completedQuotes,
			archivedQuotes,
			pendingReviews,
			approvedReviews,
			rejectedReviews,
			submittedReviews,
			quotesLast7Days,
			quotesLast30Days,
			completedQuotesLast30Days,
			reviewRequestsSent,
			reviewRequestsSentLast30Days,
			reviewsLast30Days,
			approvedReviewsLast30Days,
			approvedRatingAgg,
			approvedRatingAggLast30Days,
		] = await Promise.all([
			quotes.countDocuments({}),
			quotes.countDocuments({ status: "new" }),
			quotes.countDocuments({ status: "contacted" }),
			quotes.countDocuments({ status: "scheduled" }),
			quotes.countDocuments({ status: "completed" }),
			quotes.countDocuments({ status: "archived" }),
			reviews.countDocuments({ status: "pending" }),
			reviews.countDocuments({ status: "approved" }),
			reviews.countDocuments({ status: "rejected" }),
			reviews.countDocuments({}),
			quotes.countDocuments({ submittedAt: { $gte: sevenDaysAgo } }),
			quotes.countDocuments({ submittedAt: { $gte: thirtyDaysAgo } }),
			quotes.countDocuments({
				status: "completed",
				completedAt: { $gte: thirtyDaysAgo },
			}),
			quotes.countDocuments({
				"review.requestedAt": { $type: "date" },
			}),
			quotes.countDocuments({
				"review.requestedAt": { $gte: thirtyDaysAgo },
			}),
			reviews.countDocuments({ submittedAt: { $gte: thirtyDaysAgo } }),
			reviews.countDocuments({
				status: "approved",
				submittedAt: { $gte: thirtyDaysAgo },
			}),
			reviews
				.aggregate([
					{
						$match: {
							status: "approved",
							rating: { $type: "number" },
						},
					},
					{
						$group: {
							_id: null,
							avgRating: { $avg: "$rating" },
						},
					},
				])
				.toArray(),
			reviews
				.aggregate([
					{
						$match: {
							status: "approved",
							submittedAt: { $gte: thirtyDaysAgo },
							rating: { $type: "number" },
						},
					},
					{
						$group: {
							_id: null,
							avgRating: { $avg: "$rating" },
						},
					},
				])
				.toArray(),
		]);

		const averageApprovedRating = round(
			approvedRatingAgg?.[0]?.avgRating ?? 0,
			1,
		);

		const averageApprovedRatingLast30Days = round(
			approvedRatingAggLast30Days?.[0]?.avgRating ?? 0,
			1,
		);

		const reviewSubmissionRate =
			reviewRequestsSent > 0
				? round((submittedReviews / reviewRequestsSent) * 100, 1)
				: 0;

		const reviewSubmissionRateLast30Days =
			reviewRequestsSentLast30Days > 0
				? round(
						(reviewsLast30Days / reviewRequestsSentLast30Days) *
							100,
						1,
					)
				: 0;

		const reviewRate =
			completedQuotes > 0
				? round((approvedReviews / completedQuotes) * 100, 1)
				: 0;

		const reviewRateLast30Days =
			completedQuotesLast30Days > 0
				? round(
						(approvedReviewsLast30Days /
							completedQuotesLast30Days) *
							100,
						1,
					)
				: 0;

		return json(200, {
			ok: true,
			metrics: {
				totalQuotes,
				newQuotes,
				contactedQuotes,
				scheduledQuotes,
				completedQuotes,
				archivedQuotes,
				pendingReviews,
				approvedReviews,
				rejectedReviews,
				submittedReviews,
				reviewRequestsSent,
				quotesLast7Days,
				quotesLast30Days,
				completedQuotesLast30Days,
				reviewRequestsSentLast30Days,
				reviewsLast30Days,
				approvedReviewsLast30Days,
				averageApprovedRating,
				averageApprovedRatingLast30Days,
				reviewSubmissionRate,
				reviewSubmissionRateLast30Days,
				reviewRate,
				reviewRateLast30Days,
			},
		});
	} catch (err) {
		console.error("admin-dashboard error:", err);

		return json(500, {
			ok: false,
			error: "Server error",
		});
	}
};
