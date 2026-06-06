import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BranchProvider } from "./context/BranchContext";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Live from "./pages/Live";
import Location from "./pages/Location";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import About from "./pages/About";
import BackgroundLayout from "./components/BackgroundLayout";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NewMemberModal from "./components/NewMemberModal";
import PostDetail from "./pages/PostDetail";
import Events from "./pages/Events.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import Stories from "./pages/Stories";

export default function App() {
    return (
        <AuthProvider>
            <BranchProvider>
                <BrowserRouter>
                    <ScrollToTop />

                    {/* ✅ SHOWS ON NEW SESSION ONLY */}
                    <NewMemberModal />

                    <Navbar />

                    <div className="pt-20 sm:pt-32">
                        <BackgroundLayout>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/gallery" element={<Gallery />} />
                                <Route path="/live" element={<Live />} />
                                <Route path="/location" element={<Location />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/privacy" element={<Privacy />} />
                                <Route path="/terms" element={<Terms />} />
                                <Route path="/posts/:id" element={<PostDetail />} />
                                <Route path="/events" element={<Events />} />
                                <Route path="/events/:id" element={<EventDetails />} />
                                <Route path="/stories" element={<Stories />} />

                                {/* ADMIN */}
                                <Route path="/admin" element={<AdminLogin />} />
                                <Route
                                    path="/admin/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                        </BackgroundLayout>
                    </div>

                    <Footer />
                </BrowserRouter>
            </BranchProvider>
        </AuthProvider>
    );
}
