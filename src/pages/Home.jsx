import {useEffect, useState} from "react";
import {useBranch} from "../context/BranchContext";
import {supabase} from "../lib/supabaseClient";
import {FiClock} from "react-icons/fi";
import {useNavigate} from "react-router-dom";
import BlogSection from "../components/BlogSection";

/* ========================
   CACHE
======================== */
const CACHE_TTL = 60 * 1000;

const getCache = (key) => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    try {
        const {data, timestamp} = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_TTL) {
            localStorage.removeItem(key);
            return null;
        }
        return data;
    } catch {
        return null;
    }
};

const setCache = (key, data) => {
    localStorage.setItem(
        key,
        JSON.stringify({data, timestamp: Date.now()})
    );
};

export default function Home() {
    const {branch} = useBranch();
    const navigate = useNavigate();

    const [branchData, setBranchData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [dailyMessage, setDailyMessage] = useState(null);
    const [posts, setPosts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(Date.now());
    const [visibleItems, setVisibleItems] = useState(false);
    const [showNoLiveModal, setShowNoLiveModal] = useState(false);
    const [viewers, setViewers] = useState(0);

    /* FORMATTERS */
    const formatDate = (date) =>
        new Date(date).toLocaleDateString([], {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    /* HERO SLIDER (FROM NEW VERSION) */
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);

    const heroSlides = [
        {
            image:
                "https://res.cloudinary.com/dkwfi3iku/image/upload/f_auto,q_auto:best,w_2400/v1779222991/Photoroom_20260509_193856_xqsjn7.jpg",
            title: "Welcome Home",
            subtitle: "Join Us Every Week"
        },
        {
            image:
                "https://res.cloudinary.com/dkwfi3iku/image/upload/f_auto,q_auto:best,w_2400/v1780699801/cropped_image_jnpcmx.png",
            title: "Spirit Filled Ministries",
            subtitle: "Practical • Deliverance • Healing"
        },
    ];

    /* ========================
       TIME + SLIDE
    ======================== */
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!branchData?.live_url) return;

        // Start viewers between 30–120
        setViewers(Math.floor(Math.random() * 90) + 30);

        const interval = setInterval(() => {
            setViewers((prev) => {
                const change = Math.floor(Math.random() * 6);

                return Math.max(
                    20,
                    prev + (Math.random() > 0.5 ? change : -change)
                );
            });
        }, 4000);

        return () => clearInterval(interval);
    }, [branchData?.live_url]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) =>
                prev === heroSlides.length - 1 ? 0 : prev + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 0;
                return prev + 2;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setProgress(0);
    }, [currentSlide]);

    /* ========================
       DATA
    ======================== */
    useEffect(() => {
        if (!branch) return;
        let ignore = false;

        async function load() {
            setVisibleItems(false);

            const cacheKey = `home-${branch}`;
            const cached = getCache(cacheKey);

            if (cached) {
                setBranchData(cached.branch);
                setActivities(cached.activities);
                setDailyMessage(cached.message);
                setPosts(cached.posts || []);
                setLoading(false);
            }

            const [
                {data: b},
                {data: a},
                {data: m},
                {data: p},
            ] = await Promise.all([
                supabase.from("branches").select("*").eq("id", branch).single(),
                supabase.from("activities").select("*").eq("branch_id", branch).order("event_date", {ascending: true}),
                supabase.from("daily_messages").select("message").order("created_at", {ascending: false}).limit(1).maybeSingle(),
                supabase.from("posts").select("*").eq("published", true).order("created_at", {ascending: false}).limit(3),
            ]);

            if (ignore) return;

            setBranchData(b);
            setActivities(a || []);
            setDailyMessage(m?.message || null);
            setPosts(p || []);

            setCache(cacheKey, {
                branch: b,
                activities: a || [],
                message: m?.message || null,
                posts: p || [],
            });

            setLoading(false);
            setTimeout(() => setVisibleItems(true), 100);
        }

        load();
        return () => {
            ignore = true;
        };
    }, [branch]);

    const formatTime = (date) =>
        new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

    const getCountdown = (date) => {
        const diff = new Date(date).getTime() - now;

        if (diff <= 0 && diff > -7200000) return "LIVE NOW";
        if (diff <= 0) return "Ended";

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);

        if (d > 0) return `${d}d ${h}h`;
        return `${h}h ${m}m`;
    };

    const cardAnim = () =>
        `transition-all duration-700 ease-out transform ${
            visibleItems ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`;

    const upcomingActivities = activities
        .filter((a) => {
            const endTime = a.end_date
                ? new Date(a.end_date).getTime()
                : new Date(a.event_date).getTime();
            return endTime >= now;
        })
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    const topTwoEvents = upcomingActivities.slice(0, 2);

    const handleWatchLive = () => {
        if (!branchData?.live_url) {
            setShowNoLiveModal(true);
            return;
        }
        navigate("/live");
    };

    if (loading && !branchData) {
        return (
            <div className="text-center py-10 text-gray-400">
                Loading…
            </div>
        );
    }

    return (
        <div className="overflow-x-hidden">

            {/* ================= HERO ================= */}
            <div className="relative h-[85vh] overflow-hidden mb-12 md:mb-16 rounded-b-[2rem]">

                {/* SLIDES */}
                {heroSlides.map((slide, i) => (
                    <div
                        key={i}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            currentSlide === i ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center scale-105"
                            style={{backgroundImage: `url(${slide.image})`}}
                        />
                        <div className="absolute inset-0 bg-black/60"/>

                        {/* CONTENT */}
                        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 text-white">

                            <h1 className="text-[clamp(1.8rem,5vw,3.5rem)] font-bold leading-tight">
                                {slide.title}
                            </h1>

                            <p className="mt-2 text-sm md:text-base text-white/80 max-w-xl">
                                {slide.subtitle}
                            </p>

                            {/* BUTTONS */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                {branchData?.live_url && (
                                    <div className="mt-4 flex flex-wrap items-center gap-4 text-white">

                                        {/* LIVE BADGE */}
                                        <span
                                            className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold animate-pulse">🔴 LIVE NOW</span>

                                        {/* STREAM TEXT */}
                                        <span className="text-sm text-white/90">Service is currently streaming</span>

                                        {/* VIEWERS */}
                                        <div className="flex items-center gap-2 ml-2">
                                            <span className="h-2 w-2 bg-red-500 rounded-full animate-ping"/>
                                            <span className="text-sm">👀 {viewers} watching</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleWatchLive}
                                    className={`px-6 py-3 rounded-full font-semibold ${
                                        branchData?.live_url
                                            ? "bg-red-600 animate-pulse"
                                            : "bg-gray-500"
                                    }`}
                                >
                                    {branchData?.live_url ? "Watch Live" : "Watch Live"}
                                </button>

                                <button
                                    onClick={() => navigate("/events")}
                                    className="px-6 py-3 rounded-full bg-white/10 border border-white/30"
                                >
                                    Upcoming Events
                                </button>
                            </div>

                            {/* ================= TIMER (BOTTOM CENTER) ================= */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] max-w-sm">
                                <div className="flex gap-2">
                                    {heroSlides.map((_, i) => {
                                        const isActive = i === currentSlide;
                                        const isCompleted = i < currentSlide;

                                        return (
                                            <div
                                                key={i}
                                                className="relative flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden"
                                            >
                                                {/* completed */}
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-white/80"
                                                    style={{
                                                        width: isCompleted ? "100%" : "0%",
                                                        transition: "width 300ms ease-out",
                                                    }}
                                                />

                                                {/* active */}
                                                {isActive && (
                                                    <div
                                                        className="absolute left-0 top-0 h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                                                        style={{
                                                            width: `${progress}%`,
                                                            transition: "width 0.1s linear",
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ================= MESSAGE (NEW STYLE ONLY) ================= */}
            <div className="px-4 sm:px-6 md:px-10">
                {dailyMessage && (
                    <div className="mb-12">
                        <div
                            className="w-full max-w-4xl mx-auto rounded-2xl px-4 sm:px-6 py-6 md:py-8 text-center bg-white/70 backdrop-blur-xl border border-white/30 shadow-lg">
                            <p className="text-xs uppercase tracking-[0.35em] text-purple-600 mb-3">
                                Message of the Day
                            </p>
                            <p className="text-base md:text-lg uppercase tracking-[0.2em] md:tracking-[0.25em] text-gray-800">
                                “{dailyMessage}”
                            </p>
                        </div>
                    </div>
                )}

                {/* ================= EVENTS (NEW CARD STYLE ONLY) ================= */}
                <div className="px-4 sm:px-6 md:px-10">
                    <h2 className="text-xl sm:text-2xl md:text-3xl uppercase tracking-[0.3em] md:tracking-[0.4em] font-medium mb-6 md:mb-8 text-purple-600 text-left">
                        Upcoming Events
                    </h2>
                </div>

                <div>
                    <div
                        className="w-full max-w-4xl md:max-w-5xl mx-auto px-2 sm:px-4 p-4 md:p-8 rounded-2xl bg-white/80 backdrop-blur-md border border-white/30 shadow-lg">
                        {topTwoEvents.length === 0 ? (
                            <p className="uppercase tracking-[0.35em] text-red-700 text-sm text-center">
                                No events yet
                            </p>
                        ) : (
                            <div className="space-y-5 md:space-y-8">

                                {/* FEATURED */}
                                {topTwoEvents[0] && (() => {
                                    const a = topTwoEvents[0];
                                    const status = getCountdown(a.event_date);

                                    return (
                                        <div
                                            onClick={() => navigate(`/events/${a.id}`)}
                                            className={`cursor-pointer group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${cardAnim()}`}
                                        >

                                            {branchData?.live_url && status === "LIVE NOW" && (
                                                <span
                                                    className="absolute top-4 right-4 bg-red-600 text-white text-xs px-3 py-1 rounded-full animate-pulse z-20">🔴 LIVE</span>
                                            )}

                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{
                                                    backgroundImage: `url(${a.image_url || "https://images.unsplash.com/photo-1507679799987-c73779587ccf"})`,
                                                }}
                                            />

                                            <div
                                                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"/>

                                            <div className="relative z-10">

                                                <div
                                                    className="flex justify-between px-6 py-4 text-white text-sm uppercase tracking-widest">
                                                    <span>{formatDate(a.event_date)}</span>
                                                    <span
                                                        className={`font-semibold ${status === "LIVE NOW" ? "animate-pulse text-red-300" : ""}`}>
                                        {status}
                                    </span>
                                                </div>

                                                <div className="p-8 text-white">
                                                    <h3 className="text-lg md:text-2xl font-bold uppercase tracking-wide group-hover:text-purple-300 transition">
                                                        {a.title}
                                                    </h3>

                                                    <div
                                                        className="mt-3 md:mt-4 flex items-center text-xs md:text-sm gap-2 opacity-90">
                                                        <FiClock/>
                                                        {formatTime(a.event_date)}
                                                    </div>

                                                    <div
                                                        className="mt-6 text-sm uppercase tracking-widest font-semibold group-hover:underline">
                                                        View Details →
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* SECOND */}
                                {topTwoEvents[1] && (() => {
                                    const a = topTwoEvents[1];
                                    const status = getCountdown(a.event_date);

                                    return (
                                        <div
                                            onClick={() => navigate(`/events/${a.id}`)}
                                            className={`cursor-pointer group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${cardAnim()}`}
                                        >
                                            {branchData?.live_url && status === "LIVE NOW" && (
                                                <span
                                                    className="absolute top-4 right-4 bg-red-600 text-white text-xs px-3 py-1 rounded-full animate-pulse z-20">🔴 LIVE</span>
                                            )}

                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{
                                                    backgroundImage: `url(${a.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"})`,
                                                }}
                                            />

                                            <div className="absolute inset-0 bg-black/60"/>

                                            <div className="relative z-10">

                                                <div
                                                    className="flex justify-between px-5 py-3 text-white text-xs uppercase tracking-widest">
                                                    <span>{formatDate(a.event_date)}</span>
                                                    <span>{status}</span>
                                                </div>

                                                <div className="p-6 text-white">
                                                    <h3 className="text-base md:text-lg font-semibold group-hover:text-purple-300 transition">
                                                        {a.title}
                                                    </h3>

                                                    <div className="mt-3 flex items-center text-sm gap-2 opacity-90">
                                                        <FiClock/>
                                                        {formatTime(a.event_date)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                            </div>
                        )}
                    </div>
                </div>

                {/* BLOG (UNCHANGED) */}
                {posts.length > 0 && (
                    <div className="mt-16 px-4 sm:px-6 md:px-10">
                        <BlogSection posts={posts}/>
                    </div>
                )}

                {/* MODAL (UNCHANGED) */}
                {showNoLiveModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowNoLiveModal(false)}
                        />
                        <div className="relative z-10 bg-white p-6 rounded-xl">
                            No live stream available
                            <button onClick={() => setShowNoLiveModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}