import {useEffect, useState} from "react";
import {useBranch} from "../context/BranchContext";
import {supabase} from "../lib/supabaseClient";
import {useNavigate} from "react-router-dom";
import BlogSection from "../components/BlogSection";
import {CalendarDays, Clock3, PlayCircle, MapPin, ArrowRight, BookOpen,
Smartphone,
Library,} from "lucide-react";

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

    const streamStatus = branchData?.stream_status || "offline";
    const hasStream = !!branchData?.live_url;

    const isLive = streamStatus === "live" && hasStream;
    const isReplay = streamStatus === "ended" && hasStream;

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
        if (isLive || isReplay) {
            navigate("/live");
            return;
        }

        setShowNoLiveModal(true);
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
                            className="absolute inset-0 bg-cover bg-center scale-105 brightness-110"
                            style={{backgroundImage: `url(${slide.image})`}}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

                        {/* CONTENT */}
                        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 text-white">

                            <h1 className="text-[clamp(1.8rem,5vw,3.5rem)] font-bold leading-tight">
                                {slide.title}
                            </h1>

                            <p className="mt-2 text-sm md:text-base text-white/80 max-w-xl">
                                {slide.subtitle}
                            </p>

                            <div className="flex justify-center md:justify-start gap-4 mt-6">

                                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4">
                                    <div className="text-2xl font-bold">
                                        {upcomingActivities.length}
                                    </div>

                                    <div className="text-white/70 text-xs uppercase">
                                        Events
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4">
                                    <div className="text-2xl font-bold">
                                        {posts.length}
                                    </div>

                                    <div className="text-white/70 text-xs uppercase">
                                        Articles
                                    </div>
                                </div>

                            </div>

                            {/* BUTTONS */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                {isLive && (
                                    <div className="mt-4 flex flex-wrap items-center gap-4 text-white">

                                        {/* LIVE BADGE */}
                                        <span
                                            className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold animate-pulse">🔴 LIVE NOW</span>

                                        {/* STREAM TEXT */}
                                        <span className="text-sm text-white/90">Service is currently streaming</span>

                                        {isReplay && (
                                            <div className="mt-4 flex items-center gap-3">
                                                 <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                                                        🔁 Replay Available
                                                 </span>
                                                <span className="text-sm text-white/90">
                                                     Watch last service recording
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={handleWatchLive}
                                    className={`px-6 py-3 rounded-full font-semibold ${
                                        isLive
                                            ? "bg-red-600 animate-pulse"
                                            : "bg-gray-500"
                                    }`}
                                >
                                    {isLive
                                        ? "Join Live Stream"
                                        : isReplay
                                            ? "Watch Replay"
                                            : "No Stream Available"}
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

            <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">

                <div className="grid md:grid-cols-3 gap-6">

                    <div
                        onClick={handleWatchLive}
                        className="cursor-pointer bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                    >
                        <PlayCircle className="w-8 h-8 text-purple-600 mb-4" />

                        <h3 className="font-semibold text-lg mb-2">
                            Watch Live
                        </h3>

                        <p className="text-gray-500 text-sm">
                            Join live services and special broadcasts.
                        </p>
                    </div>

                    <div
                        onClick={() => navigate("/events")}
                        className="cursor-pointer bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                    >
                        <CalendarDays className="w-8 h-8 text-purple-600 mb-4" />

                        <h3 className="font-semibold text-lg mb-2">
                            Upcoming Events
                        </h3>

                        <p className="text-gray-500 text-sm">
                            Conferences, services and ministry gatherings.
                        </p>
                    </div>

                    <div
                        onClick={() => navigate("/location")}
                        className="cursor-pointer bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                    >
                        <MapPin className="w-8 h-8 text-purple-600 mb-4" />

                        <h3 className="font-semibold text-lg mb-2">
                            Visit Us
                        </h3>

                        <p className="text-gray-500 text-sm">
                            Find a branch near you.
                        </p>
                    </div>

                </div>
            </div>

            <div className="h-12" />

            {/* ================= MESSAGE (NEW STYLE ONLY) ================= */}
            <div className="px-4 sm:px-6 md:px-10">
                {dailyMessage && (
                    <div className="mb-16 px-4">
                        <div
                            className="relative max-w-5xl mx-auto overflow-hidden rounded-[2rem] bg-white/70
                            backdrop-blur-xl border border-white/30 shadow-xl p-10 md:p-14 text-center"
                        >
                            {/* Decorative gradient blobs */}
                            <div
                                className="absolute -top-20 -left-20 w-60 h-60 bg-purple-200/40 rounded-full blur-3xl"/>
                            <div
                                className="absolute -bottom-20 -right-20 w-60 h-60 bg-sky-200/40 rounded-full blur-3xl"/>

                            <div className="relative z-10">
                                <span
                                    className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-xs uppercase tracking-[0.3em] mb-6">
                                  ✨ Daily Encouragement
                                </span>

                                <blockquote
                                    className="text-2xl md:text-4xl font-light leading-relaxe text-gray-800">
                                    “{dailyMessage}”
                                </blockquote>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= EVENTS (NEW CARD STYLE ONLY) ================= */}
                <div className="px-4 sm:px-6 md:px-10">
                    <div className="flex justify-between items-end mb-8">

                        <div>
                            <p className="uppercase tracking-[0.35em] text-purple-600 text-xs mb-2">
                                Calendar
                            </p>

                            <h2 className="text-3xl font-bold">
                                Upcoming Events
                            </h2>
                        </div>

                        <button
                            onClick={() => navigate("/events")}
                            className="text-purple-600 font-semibold"
                        >
                            View All →
                        </button>

                    </div>
                </div>

                <div className="max-w-7xl mx-auto">

                    {topTwoEvents.length === 0 ? (
                        <div className="text-center py-24">

                            <CalendarDays className="w-16 h-16 mx-auto mb-6 text-purple-300" />

                            <p className="uppercase tracking-[0.4em] text-purple-600 text-xs mb-4">
                                Events
                            </p>

                            <h3 className="text-4xl font-bold mb-4">
                                No Upcoming Events
                            </h3>

                            <p className="text-gray-500 max-w-xl mx-auto">
                                Conferences, worship gatherings and special ministry events
                                will appear here when scheduled.
                            </p>

                        </div>
                    ) : (
                        <div className="space-y-10">

                            {/* FEATURED EVENT */}
                            {topTwoEvents[0] && (() => {
                                const a = topTwoEvents[0];
                                const status = getCountdown(a.event_date);

                                return (
                                    <div
                                        onClick={() => navigate(`/events/${a.id}`)}
                                        className={`
              group
              relative
              min-h-[550px]
              overflow-hidden
              rounded-[2rem]
              cursor-pointer

              shadow-[0_20px_60px_rgba(0,0,0,0.25)]

              hover:scale-[1.01]
              hover:-translate-y-1

              transition-all
              duration-500

              ${cardAnim()}
            `}
                                    >

                                        <div
                                            className="
                absolute inset-0
                bg-cover bg-center
                transition-transform
                duration-[6000ms]
                group-hover:scale-110
              "
                                            style={{
                                                backgroundImage: `url(${
                                                    a.image_url ||
                                                    "https://images.unsplash.com/photo-1507679799987-c73779587ccf"
                                                })`,
                                            }}
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

                                        {status === "LIVE NOW" && (
                                            <div className="absolute top-6 right-6 z-20">
                <span className="px-4 py-2 rounded-full bg-red-600 text-white text-xs font-bold animate-pulse">
                  🔴 LIVE NOW
                </span>
                                            </div>
                                        )}

                                        <div className="relative z-10 flex h-full flex-col justify-end p-10 md:p-14 text-white">

                                            <div
                                                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-white/10
                  backdrop-blur-xl
                  border border-white/20
                  px-4 py-2
                  text-xs
                  uppercase
                  tracking-[0.3em]
                  w-fit
                  mb-6
                "
                                            >
                                                ✨ Featured Event
                                            </div>

                                            <div className="inline-flex w-fit rounded-full bg-purple-500/30 backdrop-blur-md px-4 py-2 text-sm mb-6">
                                                {status}
                                            </div>

                                            <h3 className="text-3xl md:text-5xl font-bold leading-tight max-w-4xl">
                                                {a.title}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-8 mt-8">

                                                <div className="flex items-center gap-2 text-white/80">
                                                    <CalendarDays className="w-5 h-5" />
                                                    {formatDate(a.event_date)}
                                                </div>

                                                <div className="flex items-center gap-2 text-white/80">
                                                    <Clock3 className="w-5 h-5" />
                                                    {formatTime(a.event_date)}
                                                </div>

                                            </div>

                                            <div
                                                className="
                  mt-10
                  inline-flex
                  items-center
                  gap-3
                  bg-white
                  text-black
                  rounded-full
                  px-6 py-3
                  font-semibold
                  transition-all
                  duration-300
                  group-hover:gap-5
                  w-fit
                "
                                            >
                                                View Event
                                                <ArrowRight className="w-4 h-4" />
                                            </div>

                                        </div>
                                    </div>
                                );
                            })()}

                            {/* SECOND EVENT */}
                            {topTwoEvents[1] && (() => {
                                const a = topTwoEvents[1];
                                const status = getCountdown(a.event_date);

                                return (
                                    <div
                                        onClick={() => navigate(`/events/${a.id}`)}
                                        className={`
    group
    cursor-pointer

    bg-white/80
    backdrop-blur-xl

    rounded-[2rem]

    border border-white/30

    p-8

    shadow-lg

    hover:shadow-2xl
    hover:-translate-y-2

    transition-all
    duration-300

    ${cardAnim()}
  `}
                                    >

                                        <div className="flex items-start justify-between mb-6">

                                            <div>

                                                <div className="text-xs uppercase tracking-[0.3em] text-purple-600 mb-3">
                                                    Upcoming
                                                </div>

                                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition">
                                                    {a.title}
                                                </h3>

                                            </div>

                                            <div className="bg-purple-100 text-purple-700 px-3 py-2 rounded-full text-sm font-semibold">
                                                {status}
                                            </div>

                                        </div>

                                        <div className="flex flex-wrap gap-6 text-gray-500 mb-8">

                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4" />
                                                {formatDate(a.event_date)}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Clock3 className="w-4 h-4" />
                                                {formatTime(a.event_date)}
                                            </div>

                                        </div>

                                        <div className="inline-flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-4 transition-all">
                                            View Event
                                            <ArrowRight className="w-4 h-4" />
                                        </div>

                                    </div>
                                );
                            })()}

                        </div>
                    )}
                </div>

                {/* ================= GROW IN GOD'S WORD ================= */}
                <div className="py-24 px-4 sm:px-6 md:px-10">

                    <div
                        className="
      relative
      overflow-hidden
      max-w-7xl
      mx-auto

      rounded-[2rem]

      bg-gradient-to-br
      from-purple-700
      via-purple-600
      to-sky-600

      shadow-[0_25px_80px_rgba(0,0,0,0.25)]
    "
                    >

                        {/* Background Glow */}
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                        <div className="relative z-10 p-10 md:p-16">

                            <p className="uppercase tracking-[0.45em] text-xs text-white/70 mb-4">
                                Resources
                            </p>

                            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                                Grow In God's Word
                            </h2>

                            <p className="max-w-2xl text-white/80 text-lg mb-10">
                                Discover trusted resources to help you understand Scripture,
                                grow in faith, and develop a deeper relationship with Christ.
                            </p>

                            <div className="grid md:grid-cols-3 gap-6">

                                {/* HOW TO READ THE BIBLE */}
                                <a
                                    href="https://bibleproject.com/videos/collections/how-to-read-the-bible/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
            group
            bg-white/10
            backdrop-blur-xl
            border border-white/20
            rounded-3xl
            p-8
            hover:bg-white/20
            hover:-translate-y-2
            transition-all
            duration-300
          "
                                >
                                    <BookOpen className="w-10 h-10 mb-5 text-white" />

                                    <h3 className="text-xl font-bold text-white mb-3">
                                        How To Read The Bible
                                    </h3>

                                    <p className="text-white/70 text-sm mb-6">
                                        Learn how the Bible fits together and discover practical ways
                                        to read Scripture with confidence.
                                    </p>

                                    <div className="flex items-center gap-2 text-white font-semibold">
                                        Explore
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </a>

                                {/* BIBLE APP */}
                                <a
                                    href="https://www.bible.com/app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
            group
            bg-white/10
            backdrop-blur-xl
            border border-white/20
            rounded-3xl
            p-8
            hover:bg-white/20
            hover:-translate-y-2
            transition-all
            duration-300
          "
                                >
                                    <Smartphone className="w-10 h-10 mb-5 text-white" />

                                    <h3 className="text-xl font-bold text-white mb-3">
                                        Bible App
                                    </h3>

                                    <p className="text-white/70 text-sm mb-6">
                                        Read the Bible, listen to audio Scripture, save notes,
                                        and follow reading plans wherever you are.
                                    </p>

                                    <div className="flex items-center gap-2 text-white font-semibold">
                                        Download
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </a>

                                {/* MORE RESOURCES */}
                                <div
                                    onClick={() => navigate("/resources")}
                                    className="
            group
            cursor-pointer
            bg-white/10
            backdrop-blur-xl
            border border-white/20
            rounded-3xl
            p-8
            hover:bg-white/20
            hover:-translate-y-2
            transition-all
            duration-300
          "
                                >
                                    <Library className="w-10 h-10 mb-5 text-white" />

                                    <h3 className="text-xl font-bold text-white mb-3">
                                        More Resources
                                    </h3>

                                    <p className="text-white/70 text-sm mb-6">
                                        Explore additional study tools, recommended resources,
                                        and practical guides to strengthen your walk with Christ.
                                    </p>

                                    <div className="flex items-center gap-2 text-white font-semibold">
                                        Explore
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-24 px-4 sm:px-6 md:px-10">
                    <div
                        className="
      max-w-7xl
      mx-auto
      overflow-hidden
      rounded-[2rem]
      bg-white
      shadow-[0_20px_60px_rgba(0,0,0,0.12)]
    "
                    >
                        <div className="grid lg:grid-cols-2">

                            {/* IMAGE */}
                            <div className="relative min-h-[500px]">

                                <img
                                    src="https://res.cloudinary.com/dkwfi3iku/image/upload/f_auto,q_auto:best,w_2400/v1776697658/IMG_9252_jiufkn.jpg"
                                    alt="Spirit Filled Ministries Leadership"
                                    className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
                                />

                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />

                            </div>

                            {/* CONTENT */}
                            <div className="flex items-center p-10 md:p-16">

                                <div>

                                    <p className="uppercase tracking-[0.4em] text-purple-600 text-xs mb-4">
                                        Leadership
                                    </p>

                                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                        A Message From Our Parents
                                    </h2>

                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        Welcome to Spirit Filled Ministries.
                                        Our heart is to see people experience the freedom,
                                        healing, deliverance and transforming power of Jesus Christ.
                                    </p>

                                    <p className="text-gray-600 leading-relaxed mb-8">
                                        Whether you are taking your first steps in faith or have
                                        been walking with Christ for many years, we pray that you
                                        will find a place of growth, encouragement and purpose.
                                    </p>

                                    <button
                                        onClick={() => navigate("/about")}
                                        className="
              inline-flex
              items-center
              gap-3
              rounded-full
              bg-purple-600
              text-white
              px-6
              py-3
              font-semibold
              transition-all
              duration-300
              hover:gap-5
              hover:bg-purple-700
            "
                                    >
                                        Learn More
                                        <ArrowRight className="w-4 h-4" />
                                    </button>

                                </div>

                            </div>

                        </div>
                    </div>
                </div>

                {/* BLOG (UNCHANGED) */}
                {posts.length > 0 && (
                    <>
                        <div className="max-w-4xl mx-auto text-center py-20">

                            <p className="text-3xl md:text-4xl font-light italic text-gray-700">
                                “Where the Spirit of the Lord is,
                                there is freedom.”
                            </p>

                            <p className="mt-4 uppercase tracking-[0.35em] text-purple-600 text-xs">
                                2 Corinthians 3:17
                            </p>

                        </div>

                        <div className="mt-16 px-4 sm:px-6 md:px-10">
                            <BlogSection posts={posts} />
                        </div>
                    </>
                )}

                {/* MODAL (UNCHANGED) */}
                {showNoLiveModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        {/* BACKDROP */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowNoLiveModal(false)}
                        />

                        {/* MODAL CARD */}
                        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl border border-white/30 p-6 text-center animate-fadeIn">

                            <div className="text-3xl mb-3">📡</div>

                            <h2 className="text-lg font-semibold text-gray-800">
                                No live service available
                            </h2>

                            <p className="text-sm text-gray-600 mt-2">
                                The live broadcast is currently offline. Please check again when the service starts.
                            </p>

                            <button
                                onClick={() => setShowNoLiveModal(false)}
                                className="mt-5 px-5 py-2 rounded-full bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}