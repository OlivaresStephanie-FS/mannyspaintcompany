import { getDb } from "./_db.js";
import jwt from "jsonwebtoken";

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

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "GET") {
			return {
				statusCode: 405,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
				},
				body: JSON.stringify({
					ok: false,
					error: "Method Not Allowed",
				}),
			};
		}

		if (!isValidBearer(event)) {
			return {
				statusCode: 401,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
				},
				body: JSON.stringify({
					ok: false,
					error: "Unauthorized",
				}),
			};
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
			quotesLast7Days,
			quotesLast30Days,
			completedQuotesLast30Days,
			reviewsLast30Days,
			approvedReviewsLast30Days,
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
			quotes.countDocuments({ submittedAt: { $gte: sevenDaysAgo } }),
			quotes.countDocuments({ submittedAt: { $gte: thirtyDaysAgo } }),
			quotes.countDocuments({
				status: "completed",
				completedAt: { $gte: thirtyDaysAgo },
			}),
			reviews.countDocuments({ submittedAt: { $gte: thirtyDaysAgo } }),
			reviews.countDocuments({
				status: "approved",
				submittedAt: { $gte: thirtyDaysAgo },
			}),
		]);

		return {
			statusCode: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store",
			},
			body: JSON.stringify({
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
					quotesLast7Days,
					quotesLast30Days,
					completedQuotesLast30Days,
					reviewsLast30Days,
					approvedReviewsLast30Days,
				},
			}),
		};
	} catch (err) {
		console.error("admin-dashboard error:", err);

		return {
			statusCode: 500,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store",
			},
			body: JSON.stringify({
				ok: false,
				error: "Server error",
			}),
		};
	}
};
