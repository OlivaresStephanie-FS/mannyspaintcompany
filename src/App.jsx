import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import AdminQuotes from "./pages/AdminQuotes";
import Review from "./components/Review";
import AdminReviews from "./pages/AdminReviews";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ padding: "24px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/admin" element={<AdminQuotes />} />
          <Route path="/review/:quoteId" element={<Review />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
