import { NavLink } from "react-router-dom";
import { FaFacebookF, FaTiktok, FaYoutube } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="relative mt-16 overflow-hidden">
            {/* Halo */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-purple-300/15 via-transparent to-sky-300/15" />

            {/* Glass surface */}
            <div className="bg-white/60 backdrop-blur-xl border-t border-white/30">
                <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12 space-y-10">

                    {/* BRAND */}
                    <div className="text-center space-y-2">
                        <p className="text-xs uppercase tracking-[0.35em] text-gray-700">
                            Spirit Filled Ministries
                        </p>
                        <p className="text-xs tracking-[0.25em] text-gray-600">
                            Practical Deliverance &amp; Healing
                        </p>
                    </div>

                    {/* SOCIALS */}
                    <div className="flex justify-center gap-4">
                        <a
                            href="https://www.facebook.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-full bg-white/70 border border-white/40 hover:shadow-md transition"
                        >
                            <FaFacebookF className="text-sm text-gray-600 hover:text-blue-600 transition" />
                        </a>

                        <a
                            href="https://www.tiktok.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-full bg-white/70 border border-white/40 hover:shadow-md transition"
                        >
                            <FaTiktok className="text-sm text-gray-600 hover:text-black transition" />
                        </a>

                        <a
                            href="https://www.youtube.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-full bg-white/70 border border-white/40 hover:shadow-md transition"
                        >
                            <FaYoutube className="text-sm text-gray-600 hover:text-red-600 transition" />
                        </a>
                    </div>

                    {/* PRIMARY NAV */}
                    <nav>
                        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-[0.3em] text-gray-700">
                            <li><NavLink to="/" className="hover:text-purple-600 transition">Home</NavLink></li>
                            <li><NavLink to="/about" className="hover:text-purple-600 transition">About</NavLink></li>
                            <li><NavLink to="/live" className="hover:text-purple-600 transition">Live</NavLink></li>
                            <li><NavLink to="/events" className="hover:text-purple-600 transition">Events</NavLink></li>
                            <li><NavLink to="/location" className="hover:text-purple-600 transition">Visit Us</NavLink></li>
                        </ul>
                    </nav>

                    {/* DIVIDER */}
                    <div className="h-px bg-white/40" />

                    {/* LEGAL STRIP */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] tracking-[0.25em] text-gray-600">
                        <div className="flex gap-6">
                            <NavLink to="/privacy" className="hover:text-purple-600 transition">
                                Privacy Policy
                            </NavLink>
                            <NavLink to="/terms" className="hover:text-purple-600 transition">
                                Terms &amp; Conditions
                            </NavLink>
                        </div>

                        <p className="text-center sm:text-right">
                            © 2003 Spirit Filled Ministries
                        </p>
                    </div>

                    {/* BUILT BY */}
                    <p className="text-center text-[11px] tracking-[0.35em] text-gray-500">
                        Built with care by Kamoso Group.
                    </p>
                </div>
            </div>
        </footer>
    );
}