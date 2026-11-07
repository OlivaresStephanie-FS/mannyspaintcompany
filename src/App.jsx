import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Reviews from "./pages/Reviews";
import ReviewsSubmit from "./pages/ReviewsSubmit";
import AdminDashboard from "./pages/AdminDashboard";
import AdminQuotes from "./pages/AdminQuotes";
import AdminReviews from "./pages/AdminReviews";
import AdminLogin from "./pages/AdminLogin";
import AdminActivity from "./pages/AdminActivity";
import Footer from "./components/Footer";

function ScrollToTop() {
	const { pathname, hash } = useLocation();

	useEffect(() => {
		if (hash) {
			const el = document.getElementById(decodeURIComponent(hash.slice(1)));
			if (el) {
				const nav = document.querySelector("header");
				const offset = nav ? nav.offsetHeight + 8 : 0;
				const top = el.getBoundingClientRect().top + window.scrollY - offset;
				window.scrollTo(0, Math.max(0, top));
				return;
			}
		}
		window.scrollTo(0, 0);
	}, [pathname, hash]);

	return null;
}

export default function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<Navbar />
			<main className="container">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/gallery" element={<Gallery />} />
					<Route path="/reviews" element={<Reviews />} />
					<Route
						path="/review/:quoteId"
						element={<ReviewsSubmit />}
					/>
					<Route path="/admin/login" element={<AdminLogin />} />
					<Route path="/admin" element={<AdminQuotes />} />
					<Route path="/admin/reviews" element={<AdminReviews />} />
					<Route
						path="/admin/dashboard"
						element={<AdminDashboard />}
					/>
					<Route path="/admin/activity" element={<AdminActivity />} />
				</Routes>
			</main>
			<Footer />
		</BrowserRouter>
	);
}
