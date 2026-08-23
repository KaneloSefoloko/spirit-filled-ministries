import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";


export default function Contact() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);
        setSuccess("");
        setError("");

        const { error } = await supabase
            .from("contact_messages")
            .insert([
                {
                    name: form.name.trim(),
                    email: form.email.trim(),
                    message: form.message.trim(),
                },
            ]);

        if (error) {
            console.error("Contact form error:", error);
            setError("Something went wrong. Please try again.");
            setSubmitting(false);
            return;
        }

        setForm({
            name: "",
            email: "",
            message: "",
        });

        setSuccess("Thank you. Your message has been sent successfully.");
        setSubmitting(false);
    };


    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-purple-50">

            {/* =====================================================
                HERO
            ====================================================== */}
            <section className="relative h-[40vh] min-h-[380px] overflow-hidden rounded-b-[2.5rem] bg-purple-900">

                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/95 to-sky-800/90" />

                <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
                    <div className="max-w-3xl">

                        <p className="uppercase tracking-[0.45em] text-purple-300 text-xs sm:text-sm mb-4">
                            Get In Touch
                        </p>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5">
                            Contact Us
                        </h1>

                        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed text-white/80">
                            We would love to hear from you. Whether you have a
                            question, need prayer, or simply want to connect,
                            we are here for you.
                        </p>

                    </div>
                </div>

            </section>

            {/* =====================================================
                CONTENT
            ====================================================== */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* =================================================
                        CONTACT INFORMATION
                    ================================================== */}
                    <div className="lg:col-span-1 space-y-4">

                        {/* EMAIL */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

                            <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                                <Mail className="w-5 h-5 text-purple-600" />
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-1">
                                Email
                            </h3>

                            <a
                                href="mailto:info@spiritfilledministries.org"
                                className="text-sm text-gray-500 hover:text-purple-600 transition break-words"
                            >
                                info@spiritfilledministries.org
                            </a>

                        </div>

                        {/* PHONE */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

                            <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                                <Phone className="w-5 h-5 text-purple-600" />
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-1">
                                Phone
                            </h3>

                            <a
                                href="tel:+27 72 800 7562"
                                className="text-sm text-gray-500 hover:text-purple-600 transition"
                            >
                                +27 72 800 7562
                            </a>

                        </div>

                        {/* LOCATIONS */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

                            <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                                <MapPin className="w-5 h-5 text-purple-600" />
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-1">
                                Visit Us
                            </h3>

                            <p className="text-sm text-gray-500 mb-4">
                                Find one of our branches near you.
                            </p>

                            <Link
                                to="/location"
                                className="inline-flex items-center text-sm font-semibold text-purple-600 hover:text-purple-800 transition"
                            >
                                Find A Branch
                            </Link>

                        </div>

                    </div>

                    {/* =================================================
                        CONTACT FORM
                    ================================================== */}
                    <div className="lg:col-span-2">

                        <div className="bg-white rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-xl border border-gray-100">

                            <div className="mb-8">

                                <p className="uppercase tracking-[0.3em] text-xs text-purple-600 font-medium mb-3">
                                    We're Here For You
                                </p>

                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                                    Send Us A Message
                                </h2>

                                <p className="text-gray-500 leading-relaxed">
                                    Have a question or need prayer? Send us a
                                    message and we will get back to you.
                                </p>

                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                <div className="grid sm:grid-cols-2 gap-5">

                                    {/* NAME */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="Your name"
                                            value={form.name}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            required
                                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition"
                                        />
                                    </div>

                                    {/* EMAIL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={form.email}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                            required
                                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition"
                                        />
                                    </div>

                                </div>

                                {/* MESSAGE */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message / Prayer Request
                                    </label>

                                    <textarea
                                        rows="7"
                                        placeholder="Tell us how we can pray with you..."
                                        value={form.message}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                message: e.target.value,
                                            }))
                                        }
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition resize-none"
                                    />
                                </div>

                                {/* SUBMIT */}
                                {success && (
                                    <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
                                        {success}
                                    </div>
                                )}

                                {error && (
                                    <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Sending..." : "Send Message"}
                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}