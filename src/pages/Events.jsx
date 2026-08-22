import {useEffect, useState} from "react";
import {useBranch} from "../context/BranchContext";
import {supabase} from "../lib/supabaseClient";
import {useNavigate} from "react-router-dom";
import {CalendarDays, Clock3, ArrowRight} from "lucide-react";

export default function Events() {
    const {branch} = useBranch();
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
            .order("event_date", {ascending: true})
            .then(({data}) => setEvents(data || []));
    }, [branch]);

    /* FILTER + REMOVE FIRST EVENT */
    const upcoming = events
        .filter(e => new Date(e.event_date) >= now)
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    const [, ...restEvents] = upcoming;
    const featured = upcoming[0];

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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-purple-50">

            {/* HERO */}
            <div
                className="relative h-[45vh] overflow-hidden rounded-b-[2.5rem] bg-gradient-to-r from-sky-600 to-purple-700">

                <div className="absolute inset-0 bg-black/20"/>

                <div className="relative h-full flex items-center justify-center text-center px-6">
                    <div>
                        <p className="uppercase tracking-[0.45em] text-purple-200 text-xs mb-4">
                            Events
                        </p>

                        <h1 className="text-white text-5xl md:text-6xl font-bold">
                            Upcoming Gatherings
                        </h1>

                        <p className="text-white/80 mt-4 max-w-2xl mx-auto">
                            Conferences, services, fellowship, outreach and special
                            ministry events.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* FEATURED EVENT */}
                {featured && (
                    <div
                        onClick={() => navigate(`/events/${featured.id}`)}
                        className=" cursor-pointer mb-12 bg-white rounded-3xl shadow-xl overflow-hidden border
                        border-white/50 hover:shadow-2xl transition-all"
                    >
                        <div className="grid lg:grid-cols-2">

                            <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-10">

                                <p className="uppercase tracking-[0.4em] text-xs mb-4">
                                    Next Event
                                </p>

                                <h2 className="text-4xl font-bold mb-6">
                                    {featured.title}
                                </h2>

                                <div className="inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm">
                                    {getCountdown(featured.event_date)}
                                </div>
                            </div>

                            <div className="p-10 flex flex-col justify-center">

                                <div className="flex items-center gap-3 text-gray-500 mb-4">
                                    <CalendarDays className="w-5 h-5"/>
                                    {new Date(featured.event_date).toDateString()}
                                </div>

                                <div className="flex items-center gap-3 text-gray-500 mb-6">
                                    <Clock3 className="w-5 h-5"/>
                                    Starts at {featured.event_date?.substring(11, 16)}
                                </div>

                                <div
                                    className="flex items-center gap-2 uppercase tracking-widest text-sm font-semibold text-purple-600">
                                    View Event
                                    <ArrowRight className="w-4 h-4"/>
                                </div>

                            </div>

                        </div>
                    </div>
                )}

                {/* SECTION HEADING */}
                <div className="mb-8">
                    <p className="uppercase tracking-[0.35em] text-purple-600 text-xs mb-2">
                        Calendar
                    </p>

                    <h2 className="text-3xl font-bold">
                        All Events
                    </h2>
                </div>

                {/* EMPTY STATE */}
                {restEvents.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 shadow-lg text-center">

                        <CalendarDays className="w-14 h-14 mx-auto text-gray-300 mb-4"/>

                        <h3 className="text-3xl font-semibold mb-4">
                            No Upcoming Events
                        </h3>

                        <p className="text-gray-600">
                            Check back soon for upcoming conferences,
                            services and special ministry gatherings.
                        </p>

                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                        {restEvents.map((e) => {
                            const date = new Date(e.event_date);

                            const day = date.getDate();

                            const month = date.toLocaleDateString("en-US", {
                                month: "short",
                            });

                            return (
                                <div
                                    key={e.id}
                                    onClick={() => navigate(`/events/${e.id}`)}
                                    className="
                  cursor-pointer
                  bg-white
                  rounded-3xl
                  shadow-md
                  hover:shadow-2xl
                  hover:-translate-y-2
                  transition-all
                  duration-300
                  overflow-hidden
                "
                                >
                                    <div className="p-6">

                                        <div className="flex gap-4 mb-6">

                                            <div
                                                className="w-16 h-16 rounded-2xl bg-purple-50 flex flex-col items-center justify-center">
                                                <div className="text-xs uppercase text-purple-600">
                                                    {month}
                                                </div>

                                                <div className="text-2xl font-bold text-purple-700">
                                                    {day}
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <div
                                                    className="inline-flex rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-xs font-semibold mb-3">
                                                    {getCountdown(e.event_date)}
                                                </div>

                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {e.title}
                                                </h3>
                                            </div>

                                        </div>

                                        <div className="text-gray-500 text-sm">
                                            Starts at {e.event_date?.substring(11, 16)}
                                        </div>

                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}
            </div>
        </div>
    );
}