import { BrowserRouter, Routes, Route } from "react-router-dom";
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

export default function App() {
	return (
		<BrowserRouter>
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
