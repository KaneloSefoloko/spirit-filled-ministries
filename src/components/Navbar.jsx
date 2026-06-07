import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useBranch } from "../context/BranchContext";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/spirit.png";

export default function Navbar() {
    const { branch, setBranch } = useBranch();
    const [branches, setBranches] = useState([]);
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const disabledBranches = ["29f7225b-2e35-4a2d-a02e-14b3d210ea72",
        "c5596872-78cc-4eb2-b633-1c7a56bbb150", "d6b36248-4580-493d-8ffa-0bd8463cfe31"];
    const visibleBranches = branches.filter(
        (b) => !disabledBranches.includes(b.id)
    );

    useEffect(() => {
        async function load() {
            const { data } = await supabase.from("branches").select("*");

            const allBranches = data || [];
            setBranches(allBranches);

            // ✅ Set default branch (Strand)
            if (!branch && allBranches.length > 0) {
                const strandBranch = allBranches.find(
                    (b) => b.name.toLowerCase().includes("strand")
                );

                if (strandBranch) {
                    setBranch(strandBranch.id);
                }
            }
        }

        load();
    }, [branch, setBranch]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* ✅ ONLY COLOR CHANGE: reacts to scroll */
    const linkStyle = ({ isActive }) =>
        `
      text-xs
      uppercase
      tracking-[0.35em]
      transition-colors duration-300
      ${
            isActive
                ? scrolled
                    ? "font-bold text-purple-700"
                    : "font-bold text-white"
                : scrolled
                    ? "text-gray-800 hover:text-purple-600"
                    : "text-white hover:text-purple-300"
        }
    `;

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-white/80 backdrop-blur-md shadow-md text-black"
                    : "bg-gradient-to-r from-sky-500 to-purple-600 text-white"
            }`}
        >
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-20 md:h-32">

                {/* LOGO */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <img
                        src={logo}
                        alt="logo"
                        className="h-14 w-14 md:h-[100px] md:w-[100px] object-contain rounded-full"
                    />
                </div>

                {/* Mobile only title */}
                <div className="md:hidden flex flex-col min-w-0">
                    <h1 className="text-xs font-semibold uppercase tracking-[0.1em] whitespace-nowrap">
                        Spirit Filled Ministries
                    </h1>

                    <h2 className="text-[8px] uppercase tracking-[0.05em] whitespace-nowrap opacity-90">
                        Practical Deliverance & Healing
                    </h2>
                </div>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center gap-8">

                    <NavLink to="/" className={linkStyle}>Home</NavLink>
                    <NavLink to="/gallery" className={linkStyle}>Media</NavLink>
                    <NavLink to="/live" className={linkStyle}>Live</NavLink>
                    <NavLink to="/events" className={linkStyle}>Events</NavLink>
                    <NavLink to="/location" className={linkStyle}>Visit Us</NavLink>
                    <NavLink to="/about" className={linkStyle}>About Us</NavLink>

                    {/* ✅ BRANCH SELECTOR (MATCHES TYPOGRAPHY) */}
                    <div className="relative">
                        <select
                            value={branch || ""}
                            onChange={(e) => setBranch(e.target.value)}
                            className="
                appearance-none
                w-full sm:w-auto
                bg-white/70 backdrop-blur-md
                border border-white/30
                rounded-full
                px-5 py-2.5 pr-12
                text-xs uppercase tracking-[0.35em]
                text-gray-900
                shadow-md
                focus:outline-none
                focus:ring-2 focus:ring-purple-500
                transition
              "
                        >
                            <option
                                value=""
                                className="uppercase tracking-[0.35em] text-gray-500"
                            >
                                Select Branch
                            </option>
                            {visibleBranches.map((b) => (
                                <option
                                    key={b.id}
                                    value={b.id}
                                    className="uppercase tracking-[0.35em]"
                                >
                                    {b.name}
                                </option>
                            ))}
                        </select>

                        {/* Custom arrow */}
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              ▼
            </span>
                    </div>
                </div>

                {/* MOBILE TOGGLE */}
                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden text-2xl px-2"
                >
                    ☰
                </button>
            </div>

            {/* MOBILE MENU */}
            {open && (
                <div className="md:hidden bg-white/90 backdrop-blur-md text-black px-5 py-3 flex flex-col gap-3 text-sm shadow-lg">
                    <NavLink className="text-sm" to="/" onClick={() => setOpen(false)}>Home</NavLink>
                    <NavLink className="text-sm" to="/gallery" onClick={() => setOpen(false)}>Media</NavLink>
                    <NavLink className="text-sm" to="/live" onClick={() => setOpen(false)}>Live</NavLink>
                    <NavLink className="text-sm" to="/events" onClick={() => setOpen(false)}>Events</NavLink>
                    <NavLink className="text-sm" to="/location" onClick={() => setOpen(false)}>Visit Us</NavLink>
                    <NavLink className="text-sm" to="/about" onClick={() => setOpen(false)}>About Us</NavLink>

                    <select
                        value={branch || ""}
                        onChange={(e) => {
                            setBranch(e.target.value);
                            setOpen(false);
                        }}
                        className="border px-3 py-2 rounded"
                    >
                        <option value="">Select branch</option>
                        {visibleBranches.map((b) => (
                            <option
                                key={b.id}
                                value={b.id}
                                className="uppercase tracking-[0.35em]"
                            >
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </nav>
    );
}