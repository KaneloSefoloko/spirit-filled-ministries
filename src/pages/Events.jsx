import { useEffect, useState } from "react";
import { useBranch } from "../context/BranchContext";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Events() {
    const { branch } = useBranch();
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [now, setNow] = useState(Date.now());

    /* LIVE COUNTDOWN CLOCK */
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!branch) return;

        supabase
            .from("activities")
            .select("*")
            .eq("branch_id", branch)
            .order("event_date", { ascending: true })
            .then(({ data }) => setEvents(data || []));
    }, [branch]);

    /* FILTER + REMOVE FIRST EVENT */
    const upcoming = events
        .filter(e => new Date(e.event_date) >= now)
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    const [, ...restEvents] = upcoming;

    const getCountdown = (date) => {
        const diff = new Date(date).getTime() - now;

        if (diff <= 0 && diff > -7200000) return "LIVE NOW";
        if (diff <= 0) return "Ended";

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);

        return `${d}d ${h}h ${m}m ${s}s`;
    };

    return (
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-16">

            <h1 className="text-3xl font-bold uppercase tracking-[0.35em] text-purple-600 mb-10 text-center">
                All Events
            </h1>

            {restEvents.length === 0 ? (
                <p className="text-center text-gray-500 uppercase tracking-widest">
                    No more events
                </p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {restEvents.map((e) => (
                        <div
                            key={e.id}
                            onClick={() => navigate(`/events/${e.id}`)}
                            className="cursor-pointer group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                        >
                            {/* TOP BAR */}
                            <div className="bg-purple-600 text-white text-xs px-4 py-2 tracking-widest flex justify-between">
                                <span>{new Date(e.event_date).toDateString()}</span>
                                <span className="font-semibold">
                                    {getCountdown(e.event_date)}
                                </span>
                            </div>

                            {/* BODY */}
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600 transition">
                                    {e.title}
                                </h3>

                                <p className="text-sm text-gray-500">
                                    Starts at {e.event_date?.substring(11, 16)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}