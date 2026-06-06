import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {FiClock, FiCalendar, FiArrowLeft, FiChevronLeft, FiChevronRight} from "react-icons/fi";

export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [nextEvent, setNextEvent] = useState(null);
    const [prevEvent, setPrevEvent] = useState(null);

    const [now, setNow] = useState(Date.now());
    const [loading, setLoading] = useState(true);

    const [yesCount, setYesCount] = useState(0);
    const [noCount, setNoCount] = useState(0);

    /* NEW RSVP STATES */
    const [showRSVPModal, setShowRSVPModal] = useState(false);
    const [rsvpResponse, setRsvpResponse] = useState("yes");

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [note, setNote] = useState("");

    const [submittingRSVP, setSubmittingRSVP] = useState(false);

    /* LIVE CLOCK */
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    /* FETCH EVENT */
    useEffect(() => {
        async function load() {
            setLoading(true);

            /* CURRENT EVENT */
            const { data, error } = await supabase
                .from("activities")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            if (error) {
                console.log(error);
            }

            setEvent(data);

            /* ALL EVENTS */
            const { data: allEvents } = await supabase
                .from("activities")
                .select("*")
                .order("event_date", { ascending: true });

            if (allEvents && data) {
                const index = allEvents.findIndex((e) => e.id === data.id);

                setPrevEvent(index > 0 ? allEvents[index - 1] : null);

                setNextEvent(
                    index < allEvents.length - 1
                        ? allEvents[index + 1]
                        : null
                );
            }

            /* RSVP COUNTS */
            const { data: rsvps } = await supabase
                .from("event_rsvps")
                .select("*")
                .eq("event_id", id);

            if (rsvps) {
                setYesCount(
                    rsvps.filter((r) => r.response === "yes").length
                );

                setNoCount(
                    rsvps.filter((r) => r.response === "no").length
                );
            }

            setLoading(false);
        }

        load();
    }, [id]);

    /* COUNTDOWN */
    const getCountdown = (date) => {
        const diff = new Date(date).getTime() - now;

        if (diff <= 0 && diff > -7200000) return "LIVE NOW";
        if (diff <= 0) return "Ended";

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);

        if (d > 0) return `${d}d ${h}h ${m}m`;
        return `${h}h ${m}m`;
    };

    /* GOOGLE CALENDAR */
    const addToGoogleCalendar = () => {
        if (!event) return;

        const title = encodeURIComponent(event.title);

        const start = new Date(event.event_date)
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(".000Z", "Z");

        const end = event.end_date
            ? new Date(event.end_date)
                .toISOString()
                .replace(/[-:]/g, "")
                .replace(".000Z", "Z")
            : start;

        const details = encodeURIComponent(
            event.description || "Church Event"
        );

        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;

        window.open(url, "_blank");
    };

    /* WHATSAPP SHARE */
    const shareWhatsApp = () => {
        if (!event) return;

        const text = encodeURIComponent(
            `Join me at "${event.title}"\n\n${window.location.href}`
        );

        window.open(`https://wa.me/?text=${text}`, "_blank");
    };

    /* OPEN RSVP MODAL */
    const openRSVP = (response) => {
        setRsvpResponse(response);
        setShowRSVPModal(true);
    };

    /* SUBMIT RSVP */
    const submitRSVP = async () => {
        if (!fullName || !phone) {
            alert("Please enter your name and phone number");
            return;
        }

        setSubmittingRSVP(true);

        const { error } = await supabase
            .from("event_rsvps")
            .insert({
                event_id: event?.id,
                response: rsvpResponse,
                full_name: fullName,
                phone,
                note,
            });

        setSubmittingRSVP(false);

        if (error) {
            alert(error.message);
            return;
        }

        if (rsvpResponse === "yes") {
            setYesCount((p) => p + 1);
        } else {
            setNoCount((p) => p + 1);
        }

        setShowRSVPModal(false);

        setFullName("");
        setPhone("");
        setNote("");

        alert("RSVP submitted successfully");
    };

    /* PROGRESS */
    const getEventProgress = (start, end) => {
        if (!end) return null;

        const toMidnight = (d) =>
            new Date(d.getFullYear(), d.getMonth(), d.getDate());

        const nowMid = toMidnight(new Date(now));
        const startMid = toMidnight(new Date(start));
        const endMid = toMidnight(new Date(end));

        if (nowMid < startMid || nowMid > endMid) return null;

        const totalDays =
            Math.floor((endMid - startMid) / (1000 * 60 * 60 * 24)) + 1;

        const currentDay =
            Math.floor((nowMid - startMid) / (1000 * 60 * 60 * 24)) + 1;

        return { current: currentDay, total: totalDays };
    };

    if (loading) {
        return (
            <div className="text-center text-gray-400 mt-20">
                Loading event...
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center text-white mt-20">
                Event not found
            </div>
        );
    }

    const status = getCountdown(event.event_date);
    const progress = getEventProgress(event.event_date, event.end_date);

    return (
        <div className="min-h-screen text-white">

            {/* HERO */}
            <div className="relative h-[55vh] flex items-end">

                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${
                            event.image_url ||
                            "https://images.unsplash.com/photo-1507692049790-de58290a4334"
                        })`,
                    }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

                {/* BACK */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 flex items-center gap-2 text-white bg-black/60 px-4 py-2 rounded-full hover:bg-black/60 transition"
                >
                    <FiArrowLeft />
                    Back
                </button>

                {/* TITLE */}
                <div className="relative z-10 p-8">
                    <p className="text-xs uppercase tracking-[0.35em] text-purple-300 mb-2">
                        Event Details
                    </p>

                    <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-wide">
                        {event.title}
                    </h1>

                    <div className="mt-4 text-sm text-white/80">
                        {status === "LIVE NOW" ? (
                            <span className="text-red-400 font-bold animate-pulse">
                                🔴 LIVE NOW
                            </span>
                        ) : (
                            status
                        )}
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

                {/* DATE */}
                <div className="bg-black/55 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/40">
                    <div className="flex items-center gap-3 text-purple-300">
                        <FiCalendar />
                        <span>
                            {new Date(event.event_date).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-white/70">
                        <FiClock />
                        <span>
                            {new Date(event.event_date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
                </div>

                {/* COUNTDOWN */}
                <div className="bg-black/55 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/40 text-center">
                    <p className="uppercase tracking-[0.3em] text-xs text-purple-300 mb-2">
                        Countdown
                    </p>

                    <p className="text-3xl font-bold">{status}</p>
                </div>

                {/* PROGRESS */}
                {progress && (
                    <div className="bg-black/55 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/40">
                        <p className="text-sm text-purple-300 mb-2">
                            Day {progress.current} of {progress.total}
                        </p>

                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-600"
                                style={{
                                    width: `${(progress.current / progress.total) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* DESCRIPTION */}
                {event.description && (
                    <div className="bg-black/55 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/40">
                        <p className="text-white/80 leading-relaxed">
                            {event.description}
                        </p>
                    </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="grid sm:grid-cols-2 gap-4">

                    <button
                        onClick={addToGoogleCalendar}
                        className="py-4 rounded-xl bg-black/55 hover:bg-black/70 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/30 font-semibold transition"
                    >
                        📅 Add to Google Calendar
                    </button>

                    <button
                        onClick={shareWhatsApp}
                        className="py-4 rounded-xl bg-green-600 hover:bg-green-500 font-semibold transition"
                    >
                        WhatsApp Share
                    </button>
                </div>

                {/* RSVP */}
                <div className="bg-black/55 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/40">

                    <p className="uppercase tracking-[0.3em] text-xs text-purple-300 mb-4">
                        RSVP
                    </p>

                    <div className="flex gap-4">

                        <button
                            onClick={() => openRSVP("yes")}
                            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition font-semibold"
                        >
                            YES ({yesCount})
                        </button>

                        <button
                            onClick={() => openRSVP("no")}
                            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition font-semibold"
                        >
                            NO ({noCount})
                        </button>
                    </div>
                </div>

                {/* LIVE */}
                {event.live_url && (
                    <button
                        onClick={() => window.open(event.live_url, "_blank")}
                        className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 font-semibold transition"
                    >
                        ▶ Watch Live
                    </button>
                )}

                {/* NAVIGATION */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4">

                    {prevEvent ? (
                        <button
                            onClick={() =>
                                navigate(`/events/${prevEvent.id}`)
                            }
                            className="flex items-center gap-2 justify-center py-4 rounded-xl bg-black/55 hover:bg-black/70 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/30 transition"
                        >
                            <FiChevronLeft />
                            Previous Event
                        </button>
                    ) : (
                        <div />
                    )}

                    {nextEvent && (
                        <button
                            onClick={() =>
                                navigate(`/events/${nextEvent.id}`)
                            }
                            className="flex items-center gap-2 justify-center py-4 rounded-xl bg-purple-600 hover:bg-purple-500 transition"
                        >
                            Next Event
                            <FiChevronRight />
                        </button>
                    )}
                </div>
            </div>

            {/* RSVP MODAL */}
            {showRSVPModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-6">

                    {/* BACKDROP */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowRSVPModal(false)}
                    />

                    {/* CARD */}
                    <div className="relative z-10 w-full max-w-md rounded-3xl bg-[#111] border border-white/10 shadow-2xl p-6">

                        <h2 className="text-2xl font-bold mb-2">
                            RSVP to Event
                        </h2>

                        <p className="text-white/60 text-sm mb-6">
                            {rsvpResponse === "yes"
                                ? "You're attending this event."
                                : "You won't attend this event."}
                        </p>

                        {/* NAME */}
                        <div className="mb-4">
                            <label className="text-sm text-white/70 mb-2 block">
                                Full Name
                            </label>

                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
                            />
                        </div>

                        {/* PHONE */}
                        <div className="mb-4">
                            <label className="text-sm text-white/70 mb-2 block">
                                Phone Number
                            </label>

                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g 0712345678"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
                            />
                        </div>

                        {/* NOTE */}
                        <div className="mb-6">
                            <label className="text-sm text-white/70 mb-2 block">
                                Message (optional)
                            </label>

                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={4}
                                placeholder="Prayer request or message..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 resize-none"
                            />
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-3">

                            <button
                                onClick={() => setShowRSVPModal(false)}
                                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={submitRSVP}
                                disabled={submittingRSVP}
                                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition font-semibold"
                            >
                                {submittingRSVP
                                    ? "Submitting..."
                                    : "Submit RSVP"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}