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
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import NewMemberModal from "./components/NewMemberModal";
import PostDetail from "./pages/PostDetail";
import Events from "./pages/Events.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import Stories from "./pages/Stories";
import ResetPassword from "./pages/ResetPassword.jsx";
import Sermons from "./pages/Sermons";
import Resources from "./pages/Resources.jsx";
import Videos from "./pages/Videos.jsx";
import Contact from "./pages/Contact.jsx";
import BibleQuiz from "./pages/BibleQuiz";
import BibleLeaderboard from "./pages/BibleLeaderboard.jsx";

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
                                <Route path="/sermons" element={<Sermons />} />
                                <Route path="/resources" element={<Resources />} />
                                <Route path="/videos" element={<Videos />} />
                                <Route path="/teachings" element={<Videos />} />
                                <Route path="/testimonies" element={<Videos />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/bible-quiz" element={<BibleQuiz />} />

                                {/* ADMIN */}
                                <Route path="/admin" element={<AdminLogin />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/bible-quiz/leaderboard" element={<BibleLeaderboard />}
                                />
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
