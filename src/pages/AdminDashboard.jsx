import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/* ======================================================
   ADMIN DASHBOARD
====================================================== */
export default function AdminDashboard() {
    /* ========================
       BRANCHES
    ======================== */
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [branchLiveUrl, setBranchLiveUrl] = useState("");


    /* ========================
       ACTIVITIES
    ======================== */
    const [activities, setActivities] = useState([]);

    const [activity, setActivity] = useState("");
    const [description, setDescription] = useState("");

    const [eventDate, setEventDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [liveUrl, setLiveUrl] = useState("");

    const [editing, setEditing] = useState(null);

    /* ========================
       IMAGE
    ======================== */
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    /* ========================
       MESSAGE OF THE DAY
    ======================== */
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState([]);

    /* ========================
       NEW MEMBERS
    ======================== */
    const [newMembers, setNewMembers] = useState([]);

    /* ========================
       RSVP
    ======================== */
    const [rsvpStats, setRsvpStats] = useState({});

    /* ========================
       INITIAL LOAD
    ======================== */
    useEffect(() => {
        async function load() {
            const { data: b } = await supabase
                .from("branches")
                .select("*");

            if (b?.length) {
                setBranches(b);
                setSelectedBranch(b[0].id);

                loadActivities(b[0].id);
            }

            loadMessages();
            loadNewMembers();
            loadRSVPStats();
        }

        load();
    }, []);


    useEffect(() => {
        if (!selectedBranch) return;

        loadActivities(selectedBranch);

        // ✅ Load branch live URL
        async function loadBranchLive() {
            const { data } = await supabase
                .from("branches")
                .select("live_url")
                .eq("id", selectedBranch)
                .single();

            if (data) {
                setBranchLiveUrl(data.live_url || "");
            }
        }

        loadBranchLive();
    }, [selectedBranch]);

    /* ========================
       LOADERS
    ======================== */
    const loadActivities = async (branchId) => {
        const { data } = await supabase
            .from("activities")
            .select("*")
            .eq("branch_id", branchId)
            .order("event_date", { ascending: true });

        setActivities(data || []);
    };

    const loadMessages = async () => {
        const { data } = await supabase
            .from("daily_messages")
            .select("*")
            .order("created_at", { ascending: false });

        setMessages(data || []);
    };

    const loadNewMembers = async () => {
        const { data, error } = await supabase
            .from("new_members")
            .select(`
                id,
                full_name,
                email,
                phone,
                created_at,
                branch_id,
                branches ( name )
            `)
            .order("created_at", { ascending: false });

        if (!error) {
            setNewMembers(data || []);
        }
    };

    const loadRSVPStats = async () => {
        const { data } = await supabase
            .from("event_rsvps")
            .select("*");

        if (!data) return;

        const grouped = {};

        data.forEach((rsvp) => {
            if (!grouped[rsvp.event_id]) {
                grouped[rsvp.event_id] = {
                    yes: 0,
                    no: 0,
                };
            }

            if (rsvp.response === "yes") {
                grouped[rsvp.event_id].yes += 1;
            }

            if (rsvp.response === "no") {
                grouped[rsvp.event_id].no += 1;
            }
        });

        setRsvpStats(grouped);
    };

    /* ========================
       IMAGE UPLOAD
    ======================== */
    const handleFile = (file) => {
        if (!file) return;

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        setUploading(true);

        const fileName = `${Date.now()}-${imageFile.name}`;

        const { error } = await supabase.storage
            .from("activity-images")
            .upload(fileName, imageFile);

        if (error) {
            alert(error.message);
            setUploading(false);
            return null;
        }

        const { data } = supabase.storage
            .from("activity-images")
            .getPublicUrl(fileName);

        setUploading(false);

        return data.publicUrl;
    };

    /* ========================
       ACTIVITIES CRUD
    ======================== */
    const addActivity = async () => {
        if (!activity || !eventDate) {
            alert("Please complete the required fields.");
            return;
        }

        const imageUrl = await uploadImage();

        await supabase.from("activities").insert({
            branch_id: selectedBranch,
            title: activity,
            description,
            event_date: eventDate,
            end_date: endDate || null,
            live_url: liveUrl || null,
            image_url: imageUrl,
        });

        setActivity("");
        setDescription("");
        setEventDate("");
        setEndDate("");
        setLiveUrl("");

        setImageFile(null);
        setImagePreview(null);

        loadActivities(selectedBranch);
    };

    const deleteActivity = async (id) => {
        const confirmDelete = window.confirm(
            "Delete this event permanently?"
        );

        if (!confirmDelete) return;

        await supabase
            .from("activities")
            .delete()
            .eq("id", id);

        loadActivities(selectedBranch);
    };

    const updateActivity = async () => {
        await supabase
            .from("activities")
            .update({
                title: editing.title,
                description: editing.description,
                event_date: editing.event_date,
                end_date: editing.end_date,
                image_url: editing.image_url,
                live_url: editing.live_url,
            })
            .eq("id", editing.id);

        setEditing(null);

        loadActivities(selectedBranch);
    };

    /* ========================
       MESSAGE CRUD
    ======================== */
    const addMessage = async () => {
        if (!messageText.trim()) return;

        await supabase
            .from("daily_messages")
            .insert({
                message: messageText,
            });

        setMessageText("");

        loadMessages();
    };

    const deleteMessage = async (id) => {
        await supabase
            .from("daily_messages")
            .delete()
            .eq("id", id);

        loadMessages();
    };

    /* ========================
       Go Live / End Live CRUD
    ======================== */
    const startLive = async () => {
        if (!branchLiveUrl) {
            alert("Please paste Facebook Live URL");
            return;
        }

        await supabase
            .from("branches")
            .update({ live_url: branchLiveUrl })
            .eq("id", selectedBranch);

        alert("✅ Branch is now LIVE");
    };

    const stopLive = async () => {
        await supabase
            .from("branches")
            .update({ live_url: null })
            .eq("id", selectedBranch);

        setBranchLiveUrl("");

        alert("🛑 Live stream ended");
    };

    /* ========================
       UI
    ======================== */
    return (
        <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-16">

            {/* HEADER */}
            <div>
                <p className="text-xs uppercase tracking-[0.35em] text-purple-300 mb-3">
                    Admin Panel
                </p>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                    Dashboard
                </h1>
            </div>

            {/* ========================
               NEW MEMBERS
            ======================== */}
            <section className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20">
                <h2 className="text-2xl font-bold mb-6">
                    New Members
                </h2>

                {newMembers.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No new members yet.
                    </p>
                ) : (
                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                        {newMembers.map((m) => (
                            <div
                                key={m.id}
                                className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <p className="font-bold text-lg">
                                        {m.full_name}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        {m.email}
                                    </p>

                                    {m.phone && (
                                        <p className="text-sm text-gray-600">
                                            {m.phone}
                                        </p>
                                    )}

                                    <p className="text-xs text-gray-400 mt-2">
                                        Joined{" "}
                                        {new Date(
                                            m.created_at
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <div className="mt-4 md:mt-0">
                                    <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                                        {m.branches?.name ||
                                            "No branch"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ========================
               MESSAGE OF THE DAY
            ======================== */}
            <section className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold mb-5">
                    Message of the Day
                </h2>

                <textarea
                    className="border border-gray-200 p-4 w-full rounded-2xl mb-4 outline-none focus:ring-2 focus:ring-purple-400"
                    rows={4}
                    placeholder="Write today’s message…"
                    value={messageText}
                    onChange={(e) =>
                        setMessageText(e.target.value)
                    }
                />

                <button
                    onClick={addMessage}
                    className="bg-purple-600 hover:bg-purple-500 transition text-white px-6 py-3 rounded-2xl w-full font-semibold"
                >
                    Publish Message
                </button>

                <div className="mt-6 space-y-3">
                    {messages.map((m, index) => (
                        <div
                            key={m.id}
                            className="flex justify-between items-start gap-4 border border-gray-200 p-4 rounded-2xl"
                        >
                            <div>
                                <p
                                    className={`text-sm ${
                                        index === 0
                                            ? "font-bold"
                                            : ""
                                    }`}
                                >
                                    {m.message}
                                </p>

                                {index === 0 && (
                                    <p className="text-xs text-green-600 mt-1">
                                        Currently displayed on site
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={() =>
                                    deleteMessage(m.id)
                                }
                                className="text-red-500 text-sm font-semibold"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========================
               BRANCH SELECTOR
            ======================== */}
            <section className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold mb-4">
                    Select Branch
                </h2>

                <select
                    className="border border-gray-200 p-4 w-full rounded-2xl outline-none focus:ring-2 focus:ring-purple-400"
                    value={selectedBranch}
                    onChange={(e) =>
                        setSelectedBranch(e.target.value)
                    }
                >
                    {branches.map((b) => (
                        <option
                            key={b.id}
                            value={b.id}
                        >
                            {b.name}
                        </option>
                    ))}
                </select>
            </section>

            {/* ========================
               Go Live / End Live
            ======================== */}
            <section className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold mb-4">
                    Live Control
                </h2>

                <input
                    className="border border-gray-200 p-4 rounded-2xl w-full mb-4"
                    placeholder="Paste Facebook Live URL"
                    value={branchLiveUrl}
                    onChange={(e) => setBranchLiveUrl(e.target.value)}
                />

                <div className="flex gap-4">
                    <button
                        onClick={startLive}
                        className="bg-green-500 text-white px-6 py-3 rounded-2xl w-full"
                    >
                        🔴 Go Live
                    </button>

                    <button
                        onClick={stopLive}
                        className="bg-red-500 text-white px-6 py-3 rounded-2xl w-full"
                    >
                        End Live
                    </button>
                </div>
            </section>

            {/* ========================
               ADD EVENT
            ======================== */}
            <section className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6">
                    Add Event
                </h2>

                <div className="grid gap-4">

                    <input
                        className="border border-gray-200 p-4 rounded-2xl"
                        placeholder="Event title"
                        value={activity}
                        onChange={(e) =>
                            setActivity(e.target.value)
                        }
                    />

                    <textarea
                        className="border border-gray-200 p-4 rounded-2xl"
                        rows={5}
                        placeholder="Event description..."
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium mb-2">
                                Start Date & Time
                            </p>

                            <input
                                type="datetime-local"
                                className="border border-gray-200 p-4 rounded-2xl w-full"
                                value={eventDate}
                                onChange={(e) =>
                                    setEventDate(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">
                                End Date & Time
                            </p>

                            <input
                                type="datetime-local"
                                className="border border-gray-200 p-4 rounded-2xl w-full"
                                value={endDate}
                                onChange={(e) =>
                                    setEndDate(
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                    </div>

                    <input
                        className="border border-gray-200 p-4 rounded-2xl"
                        placeholder="Live stream URL (optional)"
                        value={liveUrl}
                        onChange={(e) =>
                            setLiveUrl(e.target.value)
                        }
                    />

                    <div>
                        <p className="text-sm font-medium mb-3">
                            Event Background Image
                        </p>

                        <input
                            type="file"
                            onChange={(e) =>
                                handleFile(
                                    e.target.files[0]
                                )
                            }
                        />
                    </div>

                    {imagePreview && (
                        <img
                            src={imagePreview}
                            className="h-56 w-full rounded-2xl object-cover border"
                        />
                    )}

                    <button
                        disabled={uploading}
                        onClick={addActivity}
                        className="mt-2 bg-sky-500 hover:bg-sky-400 transition text-gray-400 px-6 py-4 rounded-2xl w-full font-semibold"
                    >
                        {uploading
                            ? "Uploading..."
                            : "Add Event"}
                    </button>
                </div>
            </section>

            {/* ========================
               EVENTS LIST
            ======================== */}
            <section className="space-y-5">

                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                        Events
                    </h2>

                    <span className="text-sm text-white/70">
                        {activities.length} total
                    </span>
                </div>

                {activities.map((a) => {
                    const stats = rsvpStats[a.id] || {
                        yes: 0,
                        no: 0,
                    };

                    return (
                        <div
                            key={a.id}
                            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl"
                        >

                            {/* IMAGE */}
                            <div
                                className="h-48 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${
                                        a.image_url ||
                                        "https://images.unsplash.com/photo-1507692049790-de58290a4334"
                                    })`,
                                }}
                            />

                            {/* CONTENT */}
                            <div className="p-6">

                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white">
                                            {a.title}
                                        </h3>

                                        <p className="text-white/70 mt-3 leading-relaxed">
                                            {a.description ||
                                                "No description yet."}
                                        </p>

                                        <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">

                                            <div className="bg-white/10 rounded-2xl p-4">
                                                <p className="text-white/50 uppercase text-xs tracking-widest mb-1">
                                                    Starts
                                                </p>

                                                <p className="text-white font-medium">
                                                    {new Date(
                                                        a.event_date
                                                    ).toLocaleString()}
                                                </p>
                                            </div>

                                            {a.end_date && (
                                                <div className="bg-white/10 rounded-2xl p-4">
                                                    <p className="text-white/50 uppercase text-xs tracking-widest mb-1">
                                                        Ends
                                                    </p>

                                                    <p className="text-white font-medium">
                                                        {new Date(
                                                            a.end_date
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* RSVP */}
                                        <div className="flex gap-4 mt-5">

                                            <div className="px-4 py-3 rounded-2xl bg-green-500/20 border border-green-400/20">
                                                <p className="text-xs uppercase tracking-widest text-green-300">
                                                    YES RSVP
                                                </p>

                                                <p className="text-2xl font-bold text-white">
                                                    {stats.yes}
                                                </p>
                                            </div>

                                            <div className="px-4 py-3 rounded-2xl bg-red-500/20 border border-red-400/20">
                                                <p className="text-xs uppercase tracking-widest text-red-300">
                                                    NO RSVP
                                                </p>

                                                <p className="text-2xl font-bold text-white">
                                                    {stats.no}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="flex flex-row lg:flex-col gap-3">
                                        <button
                                            onClick={() =>
                                                setEditing(a)
                                            }
                                            className="px-5 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 transition font-semibold"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                deleteActivity(
                                                    a.id
                                                )
                                            }
                                            className="px-5 py-3 rounded-2xl bg-red-500 hover:bg-red-400 transition text-white font-semibold"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* ========================
               EDIT MODAL
            ======================== */}
            {editing && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">

                    <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                        <h2 className="text-2xl font-bold mb-6">
                            Edit Event
                        </h2>

                        <div className="space-y-4">

                            <input
                                className="border border-gray-200 p-4 rounded-2xl w-full"
                                value={editing.title}
                                onChange={(e) =>
                                    setEditing({
                                        ...editing,
                                        title:
                                        e.target.value,
                                    })
                                }
                            />

                            <textarea
                                rows={5}
                                className="border border-gray-200 p-4 rounded-2xl w-full"
                                value={
                                    editing.description ||
                                    ""
                                }
                                onChange={(e) =>
                                    setEditing({
                                        ...editing,
                                        description:
                                        e.target.value,
                                    })
                                }
                            />

                            <input
                                type="datetime-local"
                                className="border border-gray-200 p-4 rounded-2xl w-full"
                                value={
                                    editing.event_date
                                }
                                onChange={(e) =>
                                    setEditing({
                                        ...editing,
                                        event_date:
                                        e.target.value,
                                    })
                                }
                            />

                            <input
                                type="datetime-local"
                                className="border border-gray-200 p-4 rounded-2xl w-full"
                                value={
                                    editing.end_date ||
                                    ""
                                }
                                onChange={(e) =>
                                    setEditing({
                                        ...editing,
                                        end_date:
                                        e.target.value,
                                    })
                                }
                            />

                            <input
                                className="border border-gray-200 p-4 rounded-2xl w-full"
                                placeholder="Image URL"
                                value={
                                    editing.image_url ||
                                    ""
                                }
                                onChange={(e) =>
                                    setEditing({
                                        ...editing,
                                        image_url:
                                        e.target.value,
                                    })
                                }
                            />

                            <input
                                className="border border-gray-200 p-4 rounded-2xl w-full"
                                placeholder="Live URL"
                                value={
                                    editing.live_url ||
                                    ""
                                }
                                onChange={(e) =>
                                    setEditing({
                                        ...editing,
                                        live_url:
                                        e.target.value,
                                    })
                                }
                            />

                            <button
                                onClick={
                                    updateActivity
                                }
                                className="bg-green-500 hover:bg-green-400 transition text-white px-4 py-4 w-full rounded-2xl font-semibold"
                            >
                                Save Changes
                            </button>

                            <button
                                onClick={() =>
                                    setEditing(null)
                                }
                                className="w-full py-3 text-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}