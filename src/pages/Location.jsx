import { useEffect, useMemo, useState } from "react";
import { useBranch } from "../context/BranchContext";
import { MapPin, Navigation, Search } from "lucide-react";

export default function Locations() {
    const { branch, setBranch, branches = [], loading } = useBranch();

    const [search, setSearch] = useState("");

    /*
     * Scroll to the map only when the user selects a branch.
     * We don't want the page jumping to the map when the component
     * first loads.
     */
    useEffect(() => {
        if (!branch) return;

        const map = document.getElementById("branch-map");

        if (map) {
            setTimeout(() => {
                map.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);
        }
    }, [branch]);

    /*
     * Filter branches safely.
     */
    const filteredBranches = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return branches;
        }

        return branches.filter((b) =>
            String(b?.name || "")
                .toLowerCase()
                .includes(query)
        );
    }, [branches, search]);

    /*
     * Find currently selected branch.
     */
    const selected = useMemo(() => {
        return branches.find((b) => b.id === branch) || null;
    }, [branches, branch]);

    /*
     * Loading state.
     */
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-4 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />

                    <p className="text-gray-600 font-medium">
                        Loading branches...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-purple-50">

            {/* =====================================================
                HERO
            ====================================================== */}
            <section className="relative h-[45vh] min-h-[420px] overflow-hidden rounded-b-[2.5rem]">

                <img
                    src="https://res.cloudinary.com/dkwfi3iku/image/upload/v1780693471/Photoroom_20260605_224727_df7k6e.jpg"
                    alt="Spirit Filled Ministries"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/60" />

                <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
                    <div className="max-w-3xl">

                        <p className="uppercase tracking-[0.45em] text-purple-300 text-xs sm:text-sm mb-4">
                            Locations
                        </p>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5">
                            Find A Branch
                        </h1>

                        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed text-white/80">
                            Discover a Spirit Filled Ministries location near you
                            and join us for worship, prayer and fellowship.
                        </p>

                    </div>
                </div>

            </section>

            {/* =====================================================
                MAIN CONTENT
            ====================================================== */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">

                {/* =================================================
                    SEARCH
                ================================================== */}
                <div className="max-w-xl mb-8 md:mb-10">

                    <div className="relative">

                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                        <input
                            type="text"
                            placeholder="Search branch..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}

                    </div>

                    {search && (
                        <p className="mt-3 text-sm text-gray-500">
                            {filteredBranches.length}{" "}
                            {filteredBranches.length === 1 ? "branch" : "branches"}{" "}
                            found
                        </p>
                    )}

                </div>

                {/* =================================================
                    BRANCHES + MAP
                ================================================== */}
                <div className="grid lg:grid-cols-3 gap-8 items-start">

                    {/* =================================================
                        BRANCH LIST
                    ================================================== */}
                    <div className="space-y-4">

                        {filteredBranches.map((b) => {
                            const hasLocation =
                                b?.latitude != null &&
                                b?.longitude != null;

                            const isSelected = branch === b.id;

                            return (
                                <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => setBranch(b.id)}
                                    className={`w-full text-left rounded-3xl p-5 sm:p-6 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                                        isSelected
                                            ? "border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-sky-50 shadow-xl scale-[1.01]"
                                            : "bg-white border border-gray-100 hover:shadow-lg hover:-translate-y-1"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">

                                        <div className="min-w-0">

                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {b?.name || "Unnamed Branch"}
                                            </h3>

                                            {b?.description && (
                                                <p className="text-sm leading-relaxed text-gray-500">
                                                    {b.description}
                                                </p>
                                            )}

                                            {!hasLocation && (
                                                <p className="text-xs text-red-500 mt-3 font-medium">
                                                    Location not yet available
                                                </p>
                                            )}

                                            {hasLocation && (
                                                <p className="text-xs text-purple-600 mt-3 font-medium">
                                                    View location
                                                </p>
                                            )}

                                        </div>

                                        <div
                                            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                                isSelected
                                                    ? "bg-purple-600 text-white"
                                                    : "bg-purple-50 text-purple-600"
                                            }`}
                                        >
                                            <MapPin className="w-5 h-5" />
                                        </div>

                                    </div>
                                </button>
                            );
                        })}

                        {/* =================================================
                            NO BRANCHES
                        ================================================== */}
                        {filteredBranches.length === 0 && (
                            <div className="bg-white rounded-3xl p-8 shadow-lg text-center">

                                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gray-50 flex items-center justify-center">
                                    <Search className="w-7 h-7 text-gray-300" />
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No branches found
                                </h3>

                                <p className="text-sm text-gray-500">
                                    Try searching for another branch.
                                </p>

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="mt-5 text-sm font-medium text-purple-600 hover:text-purple-800"
                                    >
                                        Clear search
                                    </button>
                                )}

                            </div>
                        )}

                    </div>

                    {/* =================================================
                        MAP
                    ================================================== */}
                    <div
                        id="branch-map"
                        className="lg:col-span-2 w-full h-[520px] sm:h-[600px] lg:h-[650px] rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-xl relative"
                    >
                        {selected?.latitude != null &&
                        selected?.longitude != null ? (
                            <div className="h-full flex flex-col">

                                {/* =================================================
                                    MAP HEADER
                                ================================================== */}
                                <div className="shrink-0 min-h-[80px] px-5 sm:px-6 py-4 flex items-center justify-between gap-4 bg-white border-b border-gray-100 z-10">

                                    <div className="min-w-0">

                                        <p className="uppercase tracking-[0.3em] text-[10px] sm:text-xs text-purple-600 font-medium">
                                            Selected Branch
                                        </p>

                                        <h3 className="font-semibold text-gray-900 mt-1 truncate text-sm sm:text-base">
                                            {selected.name}
                                        </h3>

                                    </div>

                                    {/* Coordinates */}
                                    <div className="hidden md:flex shrink-0 items-center gap-2 text-xs lg:text-sm text-gray-500">

                                        <MapPin className="w-4 h-4 text-purple-600" />

                                        <span>
                                            {Number(selected.latitude).toFixed(5)},{" "}
                                            {Number(selected.longitude).toFixed(5)}
                                        </span>

                                    </div>

                                </div>

                                {/* =================================================
                                    MAP AREA
                                ================================================== */}
                                <div className="relative flex-1 min-h-0">

                                    <iframe
                                        key={`${selected.id}-${selected.latitude}-${selected.longitude}`}
                                        title={`${selected.name} location`}
                                        className="absolute inset-0 w-full h-full border-0"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.google.com/maps?q=${encodeURIComponent(
                                            `${selected.latitude},${selected.longitude}`
                                        )}&output=embed`}
                                    />

                                    {/* =================================================
                                        MAP ACTIONS
                                    ================================================== */}
                                    <div className="absolute top-4 right-4 z-20 flex gap-2">

                                        {/* OPEN MAPS */}
                                        <a
                                            href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/95 backdrop-blur-sm text-gray-900 shadow-md border border-gray-200 font-medium text-xs hover:bg-white active:scale-95 transition-all"
                                        >
                                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                                            <span>Open Maps</span>
                                        </a>

                                        {/* DIRECTIONS */}
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 text-white shadow-md font-medium text-xs hover:bg-purple-700 active:scale-95 transition-all"
                                        >
                                            <Navigation className="w-3.5 h-3.5 shrink-0" />
                                            <span>Directions</span>
                                        </a>

                                    </div>

                                </div>

                            </div>
                        ) : (
                            /* =================================================
                               NO LOCATION
                            ================================================== */
                            <div className="h-full flex items-center justify-center px-6">

                                <div className="text-center max-w-sm">

                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-50 flex items-center justify-center">
                                        <MapPin className="w-10 h-10 text-purple-300" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        Location Coming Soon
                                    </h3>

                                    <p className="text-gray-500 leading-relaxed">
                                        This branch does not yet have a map location available.
                                    </p>

                                </div>

                            </div>
                        )}
                    </div>

                </div>

                {/* =================================================
                    PLAN YOUR VISIT
                ================================================== */}
                <section className="mt-16 md:mt-20">

                    <div className="rounded-[2rem] bg-gradient-to-r from-purple-700 to-sky-600 text-white p-8 sm:p-10 md:p-16 text-center shadow-xl">

                        <p className="uppercase tracking-[0.4em] text-xs text-white/70 mb-4">
                            Plan Your Visit
                        </p>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                            We’ll See You There
                        </h2>

                        <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/80 leading-relaxed">
                            Find your nearest branch and join us for worship, prayer,
                            fellowship and biblical teaching. We look forward to welcoming you.
                        </p>

                    </div>

                </section>

            </main>

        </div>
    );
}