import { useEffect, useState } from "react";
import { useBranch } from "../context/BranchContext";

export default function Locations() {
    const { branch, setBranch, branches, loading } = useBranch();

    const [search, setSearch] = useState("");

    // ✅ Smooth scroll to map when branch changes
    useEffect(() => {
        const map = document.getElementById("branch-map");
        map?.scrollIntoView({ behavior: "smooth" });
    }, [branch]);

    if (loading) {
        return <div className="p-10">Loading branches…</div>;
    }

    // ✅ Filter (does not change UI structure)
    const filteredBranches = branches.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    const selected = branches.find(b => b.id === branch);

    return (
        <div className="pt-28 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6">

            {/* LEFT: Branch list */}
            <div className="space-y-4 md:col-span-1">

                {/* ✅ Search (minimal, no styling disruption) */}
                <input
                    type="text"
                    placeholder="Search branch..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-3 rounded-xl border border-white/10 bg-black/40 text-white/80 mb-2 text-sm"
                />

                {filteredBranches.map(b => (
                    <button
                        key={b.id}
                        onClick={() => setBranch(b.id)}
                        className={`w-full text-left border backdrop-blur-xl rounded-2xl p-5 transition-all duration-300
            ${branch === b.id
                            ? "border-purple-500 bg-black/60 shadow-2xl shadow-black/40 scale-[1.02]"
                            : "bg-black/40 border-white/10 hover:bg-black/55 hover:border-white/20 hover:translate-x-1"
                        }`}
                    >
                        <h3 className="text-white/100 font-semibold text-md md:text-md tracking-[0.18em] mb-2">
                            {b.name}
                        </h3>

                        <p className="text-sm tracking-[0.2em] text-white/60">
                            {b.description}
                        </p>

                        {b.latitude == null && (
                            <p className="text-xs sm:text-sm tracking-[0.18em] font-bold mb-3 text-red-600 mt-2">
                                No location set
                            </p>
                        )}
                    </button>
                ))}

                {/* ✅ Empty state */}
                {filteredBranches.length === 0 && (
                    <p className="text-white/50 text-sm tracking-[0.2em]">
                        No branches found
                    </p>
                )}
            </div>

            {/* RIGHT: Map */}
            <div
                id="branch-map"
                className="md:col-span-2 h-[400px] md:h-[600px] border border-white/10 rounded-3xl overflow-hidden bg-black/50 backdrop-blur-xl shadow-2xl shadow-black/40 relative"
            >
                {selected?.latitude != null && selected?.longitude != null ? (
                    <>
                        {/* ✅ KEY FIX: forces iframe refresh when branch changes */}
                        <iframe
                            key={selected.id}
                            className="w-full h-full"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}&output=embed`}
                        />

                        {/* ✅ ACTION BUTTONS (subtle overlay, matches style) */}
                        <div className="absolute bottom-4 left-16 flex gap-3">

                            <a
                                href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs px-4 py-2 rounded-xl bg-black/70 text-white border border-white/20"
                            >
                                Open in Maps
                            </a>

                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs px-4 py-2 rounded-xl bg-purple-600 text-white"
                            >
                                Directions
                            </a>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-center px-4">
                        No location available for this branch
                    </div>
                )}
            </div>

        </div>
    );
}
