import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import BibleQuizResults from "../admin/BibleQuizResults";
import BibleQuizManager from "../admin/BibleQuizManager";

import {
    BookOpen,
    BarChart3,
    UserPlus,
    MessageSquare,
    Trash2,
    Radio,
    Square,
    Image as ImageIcon,
    Upload,
    CalendarDays,
    Pencil,
    Save,
    X,
    Plus,
    MapPin,
    CheckCircle2,
    XCircle,
} from "lucide-react";

/* ======================================================
   BIBLE QUIZ ADMIN TABS
====================================================== */

function BibleQuizAdminTabs() {
    const [activeTab, setActiveTab] = useState("management");

    return (
        <div className="space-y-6">

            {/* ==================================================
                TAB NAVIGATION
            ================================================== */}

            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col sm:flex-row gap-2">

                <button
                    type="button"
                    onClick={() => setActiveTab("management")}
                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all ${
    activeTab === "management"
        ? "bg-white text-purple-900 shadow-lg"
        : "text-black hover:text-white hover:bg-white/10"
}`}
                >
                    <BookOpen className="w-4 h-4" />
                    Quiz Management
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("results")}
                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all ${
    activeTab === "results"
        ? "bg-white text-purple-900 shadow-lg"
        : "text-black hover:text-white hover:bg-white/10"
}`}
                >
                    <BarChart3 className="w-4 h-4" />
                    Participant Results
                </button>

            </div>

            {/* ==================================================
                QUIZ MANAGEMENT
            ================================================== */}

            {activeTab === "management" && (
                <div className="bg-gray-50 rounded-3xl p-4 sm:p-6">
                    <BibleQuizManager />
                </div>
            )}

            {/* ==================================================
                PARTICIPANT RESULTS
            ================================================== */}

            {activeTab === "results" && (
                <div className="bg-gray-50 rounded-3xl p-4 sm:p-6">
                    <BibleQuizResults />
                </div>
            )}

        </div>
    );
}

/* ======================================================
   ADMIN DASHBOARD
====================================================== */

export default function AdminDashboard() {

    /* ======================================================
       BRANCHES
    ====================================================== */

    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [branchLiveUrl, setBranchLiveUrl] = useState("");

    /* ======================================================
       ACTIVITIES
    ====================================================== */

    const [activities, setActivities] = useState([]);

    const [activity, setActivity] = useState("");
    const [description, setDescription] = useState("");

    const [eventDate, setEventDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [liveUrl, setLiveUrl] = useState("");

    const [editing, setEditing] = useState(null);

    /* ======================================================
       EVENT IMAGE
    ====================================================== */

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    /* ======================================================
       MESSAGE OF THE DAY
    ====================================================== */

    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState([]);

    /* ======================================================
       NEW MEMBERS
    ====================================================== */

    const [newMembers, setNewMembers] = useState([]);

    /* ======================================================
       RSVP
    ====================================================== */

    const [rsvpStats, setRsvpStats] = useState({});

    /* ======================================================
       GALLERY
    ====================================================== */

    const [gallery, setGallery] = useState([]);
    const [galleryImage, setGalleryImage] = useState(null);
    const [galleryUploading, setGalleryUploading] = useState(false);

    /* ======================================================
       LOAD GALLERY
    ====================================================== */

    const loadGallery = async () => {
        if (!selectedBranch) return;

        const { data, error } = await supabase
            .from("gallery")
            .select("*")
            .eq("branch_id", selectedBranch);

        if (error) {
            console.error(
                "❌ Gallery loading error:",
                error
            );
            return;
        }

        setGallery(data || []);
    };

    /* ======================================================
       INITIAL LOAD
    ====================================================== */

    useEffect(() => {

        async function load() {

            const { data: branchData, error: branchError } =
                await supabase
                    .from("branches")
                    .select("*")
                    .order("name", {
                        ascending: true,
                    });

            if (branchError) {
                console.error(
                    "❌ Branch loading error:",
                    branchError
                );
            }

            if (branchData?.length) {

                setBranches(branchData);

                setSelectedBranch(
                    branchData[0].id
                );

                loadActivities(
                    branchData[0].id
                );
            }

            loadMessages();
            loadNewMembers();
            loadRSVPStats();
        }

        load();

    }, []);

    /* ======================================================
       BRANCH CHANGE
    ====================================================== */

    useEffect(() => {

        if (!selectedBranch) return;

        loadActivities(selectedBranch);

        loadGallery();

        async function loadBranchLive() {

            const { data, error } = await supabase
                .from("branches")
                .select("live_url, stream_status")
                .eq("id", selectedBranch)
                .single();

            if (error) {
                console.error(
                    "❌ Branch live loading error:",
                    error
                );
                return;
            }

            if (data) {
                setBranchLiveUrl(
                    data.live_url || ""
                );
            }
        }

        loadBranchLive();

    }, [selectedBranch]);

    /* ======================================================
       LOAD ACTIVITIES
    ====================================================== */

    const loadActivities = async (branchId) => {

        if (!branchId) return;

        const { data, error } = await supabase
            .from("activities")
            .select("*")
            .eq("branch_id", branchId)
            .order("event_date", {
                ascending: true,
            });

        if (error) {
            console.error(
                "❌ Activities loading error:",
                error
            );
            return;
        }

        setActivities(data || []);
    };

    /* ======================================================
       LOAD MESSAGES
    ====================================================== */

    const loadMessages = async () => {

        const { data, error } = await supabase
            .from("daily_messages")
            .select("*")
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            console.error(
                "❌ Messages loading error:",
                error
            );
            return;
        }

        setMessages(data || []);
    };

    /* ======================================================
       LOAD NEW MEMBERS
    ====================================================== */

    const loadNewMembers = async () => {

        const {
            data,
            error,
        } = await supabase
            .from("new_members")
            .select(`
id,
    full_name,
    email,
    phone,
    created_at,
    branch_id,
    branches (
        name
    )
        `)
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            console.error(
                "❌ New members loading error:",
                error
            );
            return;
        }

        setNewMembers(data || []);
    };

    /* ======================================================
       LOAD RSVP STATS
    ====================================================== */

    const loadRSVPStats = async () => {

        const {
            data,
            error,
        } = await supabase
            .from("event_rsvps")
            .select("*");

        if (error) {
            console.error(
                "❌ RSVP loading error:",
                error
            );
            return;
        }

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

    /* ======================================================
       EVENT IMAGE
    ====================================================== */

    const handleFile = (file) => {

        if (!file) return;

        setImageFile(file);

        setImagePreview(
            URL.createObjectURL(file)
        );
    };

    const uploadImage = async () => {

        if (!imageFile) return null;

        setUploading(true);

        const fileName =
            `${Date.now()}-${imageFile.name}`;

        const {
            error,
        } = await supabase.storage
            .from("activity-images")
            .upload(
                fileName,
                imageFile
            );

        if (error) {

            console.error(
                "❌ Event image upload error:",
                error
            );

            alert(error.message);

            setUploading(false);

            return null;
        }

        const { data } =
            supabase.storage
                .from("activity-images")
                .getPublicUrl(fileName);

        setUploading(false);

        return data.publicUrl;
    };

    /* ======================================================
       GALLERY IMAGE UPLOAD
    ====================================================== */

    const uploadGalleryImage = async () => {

        if (!galleryImage) return null;

        setGalleryUploading(true);

        const fileName =
            `${Date.now()}-${galleryImage.name}`;

        const {
            error,
        } = await supabase.storage
            .from("gallery")
            .upload(
                fileName,
                galleryImage
            );

        if (error) {

            console.error(
                "❌ Gallery upload error:",
                error
            );

            alert(error.message);

            setGalleryUploading(false);

            return null;
        }

        const { data } =
            supabase.storage
                .from("gallery")
                .getPublicUrl(fileName);

        setGalleryUploading(false);

        return data.publicUrl;
    };

    /* ======================================================
       ADD ACTIVITY
    ====================================================== */

    const addActivity = async () => {

        if (!activity || !eventDate) {

            alert(
                "Please complete the required fields."
            );

            return;
        }

        const imageUrl =
            await uploadImage();

        const {
            error,
        } = await supabase
            .from("activities")
            .insert({
                branch_id: selectedBranch,
                title: activity,
                description,
                event_date: eventDate,
                end_date: endDate || null,
                live_url: liveUrl || null,
                image_url: imageUrl,
            });

        if (error) {

            console.error(
                "❌ Add event error:",
                error
            );

            alert(error.message);

            return;
        }

        setActivity("");
        setDescription("");
        setEventDate("");
        setEndDate("");
        setLiveUrl("");

        setImageFile(null);
        setImagePreview(null);

        await loadActivities(
            selectedBranch
        );
    };

    /* ======================================================
       DELETE ACTIVITY
    ====================================================== */

    const deleteActivity = async (id) => {

        const confirmDelete =
            window.confirm(
                "Delete this event permanently?"
            );

        if (!confirmDelete) return;

        const {
            error,
        } = await supabase
            .from("activities")
            .delete()
            .eq("id", id);

        if (error) {

            console.error(
                "❌ Delete event error:",
                error
            );

            alert(error.message);

            return;
        }

        await loadActivities(
            selectedBranch
        );

        await loadRSVPStats();
    };

    /* ======================================================
       UPDATE ACTIVITY
    ====================================================== */

    const updateActivity = async () => {

        if (!editing) return;

        const {
            error,
        } = await supabase
            .from("activities")
            .update({
                title: editing.title,
                description: editing.description,
                event_date: editing.event_date,
                end_date:
                    editing.end_date || null,
                image_url:
                    editing.image_url || null,
                live_url:
                    editing.live_url || null,
            })
            .eq("id", editing.id);

        if (error) {

            console.error(
                "❌ Update event error:",
                error
            );

            alert(error.message);

            return;
        }

        setEditing(null);

        await loadActivities(
            selectedBranch
        );
    };

    /* ======================================================
       MESSAGE CRUD
    ====================================================== */

    const addMessage = async () => {

        if (!messageText.trim()) return;

        const {
            error,
        } = await supabase
            .from("daily_messages")
            .insert({
                message: messageText.trim(),
            });

        if (error) {

            console.error(
                "❌ Add message error:",
                error
            );

            alert(error.message);

            return;
        }

        setMessageText("");

        await loadMessages();
    };

    const deleteMessage = async (id) => {

        const {
            error,
        } = await supabase
            .from("daily_messages")
            .delete()
            .eq("id", id);

        if (error) {

            console.error(
                "❌ Delete message error:",
                error
            );

            alert(error.message);

            return;
        }

        await loadMessages();
    };

    /* ======================================================
       GO LIVE
    ====================================================== */

    const startLive = async () => {

        if (!branchLiveUrl) {

            alert(
                "Please paste Facebook Live URL"
            );

            return;
        }

        const {
            error,
        } = await supabase
            .from("branches")
            .update({
                live_url: branchLiveUrl,
                stream_status: "live",
            })
            .eq("id", selectedBranch);

        if (error) {

            console.error(
                "❌ Start live error:",
                error
            );

            alert(error.message);

            return;
        }

        alert(
            "Branch is now LIVE"
        );
    };

    /* ======================================================
       STOP LIVE
    ====================================================== */

    const stopLive = async () => {

        const {
            error,
        } = await supabase
            .from("branches")
            .update({
                live_url: null,
                stream_status: "replay",
            })
            .eq("id", selectedBranch);

        if (error) {

            console.error(
                "❌ Stop live error:",
                error
            );

            alert(error.message);

            return;
        }

        setBranchLiveUrl("");

        alert(
            "Live stream ended"
        );
    };

    /* ======================================================
       ADD GALLERY IMAGE
    ====================================================== */

    const addGalleryImage = async () => {

        if (!galleryImage) {

            alert(
                "Please select an image"
            );

            return;
        }

        const imageUrl =
            await uploadGalleryImage();

        if (!imageUrl) return;

        const {
            error,
        } = await supabase
            .from("gallery")
            .insert({
                branch_id: selectedBranch,
                image_url: imageUrl,
            });

        if (error) {

            console.error(
                "❌ Add gallery image error:",
                error
            );

            alert(error.message);

            return;
        }

        setGalleryImage(null);

        await loadGallery();
    };

    /* ======================================================
       DELETE GALLERY IMAGE
    ====================================================== */

    const deleteGalleryImage = async (id) => {

        const confirmDelete =
            window.confirm(
                "Delete this gallery image?"
            );

        if (!confirmDelete) return;

        const {
            error,
        } = await supabase
            .from("gallery")
            .delete()
            .eq("id", id);

        if (error) {

            console.error(
                "❌ Delete gallery image error:",
                error
            );

            alert(error.message);

            return;
        }

        await loadGallery();
    };

    /* ======================================================
       RENDER
    ====================================================== */

    return (
        <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-16">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div>

                <p className="text-xs uppercase tracking-[0.35em] text-purple-400 mb-3">
                    Admin Panel
                </p>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                    Dashboard
                </h1>

            </div>

            {/* ==================================================
                NEW MEMBERS
            ================================================== */}

            <section className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20">

                <div className="flex items-center gap-3 mb-6">

                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <UserPlus className="w-5 h-5" />
                    </div>

                    <div>

                        <h2 className="text-2xl font-bold">
                            New Members
                        </h2>

                        <p className="text-sm text-gray-500">
                            Recently registered members
                        </p>

                    </div>

                </div>

                {newMembers.length === 0 ? (

                    <p className="text-sm text-gray-500">
                        No new members yet.
                    </p>

                ) : (

                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">

                        {newMembers.map((member) => (

                            <div
                                key={member.id}
                                className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col md:flex-row md:items-center md:justify-between"
                            >

                                <div>

                                    <p className="font-bold text-lg">
                                        {member.full_name}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        {member.email}
                                    </p>

                                    {member.phone && (
                                        <p className="text-sm text-gray-600">
                                            {member.phone}
                                        </p>
                                    )}

                                    <p className="text-xs text-gray-400 mt-2">
                                        Joined{" "}
                                        {new Date(
                                            member.created_at
                                        ).toLocaleString()}
                                    </p>

                                </div>

                                <div className="mt-4 md:mt-0">

                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">

                                        <MapPin className="w-4 h-4" />

                                        {member.branches?.name ||
                                            "No branch"}

                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

            {/* ==================================================
                BIBLE QUIZ MANAGEMENT
            ================================================== */}

            <section className="space-y-8">

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

                    <div>

                        <div className="flex items-center gap-3 mb-3">

                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                                <BookOpen className="w-5 h-5" />
                            </div>

                            <p className="text-xs uppercase tracking-[0.35em] text-purple-400">
                                Scripture Challenge
                            </p>

                        </div>

                        <h2 className="text-3xl font-bold text-black">
                            Bible Quiz
                        </h2>

                        <p className="text-black mt-2 max-w-2xl">
                            Create quizzes, manage questions, review
                            participant submissions, and monitor weekly
                            Bible challenges.
                        </p>

                    </div>

                </div>

                <BibleQuizAdminTabs />

            </section>

            {/* ==================================================
                MESSAGE OF THE DAY
            ================================================== */}

            <section className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 border border-gray-100 overflow-hidden">

                <div className="flex items-center gap-3 mb-5">

                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                    </div>

                    <div>

                        <h2 className="text-2xl font-bold">
                            Message of the Day
                        </h2>

                        <p className="text-sm text-gray-500">
                            Publish the message displayed on the site
                        </p>

                    </div>

                </div>

                <textarea
                    className="border border-gray-200 p-4 w-full rounded-2xl mb-4 outline-none focus:ring-2 focus:ring-purple-400"
                    rows={4}
                    placeholder="Write today's message..."
                    value={messageText}
                    onChange={(e) =>
                        setMessageText(
                            e.target.value
                        )
                    }
                />

                <button
                    onClick={addMessage}
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 transition text-white px-6 py-3 rounded-2xl w-full font-semibold"
                >
                    <Plus className="w-4 h-4" />
                    Publish Message
                </button>

                <div className="mt-6 space-y-3">

                    {messages.map(
                        (message, index) => (

                            <div
                                key={message.id}
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
                                        {message.message}
                                    </p>

                                    {index === 0 && (

                                        <p className="flex items-center gap-1.5 text-xs text-green-600 mt-1">

                                            <CheckCircle2 className="w-3.5 h-3.5" />

                                            Currently displayed on site

                                        </p>

                                    )}

                                </div>

                                <button
                                    onClick={() =>
                                        deleteMessage(
                                            message.id
                                        )
                                    }
                                    className="inline-flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-semibold"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>

                            </div>

                        )
                    )}

                </div>

            </section>

            {/* ==================================================
                BRANCH SELECTOR
            ================================================== */}

            <section className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">

                <div className="flex items-center gap-3 mb-4">

                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <MapPin className="w-5 h-5" />
                    </div>

                    <div>

                        <h2 className="text-2xl font-bold">
                            Select Branch
                        </h2>

                        <p className="text-sm text-gray-500">
                            Choose which branch you are managing
                        </p>

                    </div>

                </div>

                <select
                    className="border border-gray-200 p-4 w-full rounded-2xl outline-none focus:ring-2 focus:ring-purple-400"
                    value={selectedBranch}
                    onChange={(e) =>
                        setSelectedBranch(
                            e.target.value
                        )
                    }
                >

                    {branches.map((branch) => (

                        <option
                            key={branch.id}
                            value={branch.id}
                        >
                            {branch.name}
                        </option>

                    ))}

                </select>

            </section>

            {/* ==================================================
                LIVE CONTROL
            ================================================== */}

            <section className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">

                <div className="flex items-center gap-3 mb-4">

                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                        <Radio className="w-5 h-5" />
                    </div>

                    <div>

                        <h2 className="text-2xl font-bold">
                            Live Control
                        </h2>

                        <p className="text-sm text-gray-500">
                            Manage the branch livestream
                        </p>

                    </div>

                </div>

                <input
                    className="border border-gray-200 p-4 rounded-2xl w-full mb-4"
                    placeholder="Paste Facebook Live URL"
                    value={branchLiveUrl}
                    onChange={(e) =>
                        setBranchLiveUrl(
                            e.target.value
                        )
                    }
                />

                <div className="flex flex-col sm:flex-row gap-4">

                    <button
                        onClick={startLive}
                        className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 transition text-white px-6 py-3 rounded-2xl w-full font-semibold"
                    >
                        <Radio className="w-4 h-4" />
                        Go Live
                    </button>

                    <button
                        onClick={stopLive}
                        className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 transition text-white px-6 py-3 rounded-2xl w-full font-semibold"
                    >
                        <Square className="w-4 h-4" />
                        End Live
                    </button>

                </div>

            </section>

            {/* ==================================================
                GALLERY
            ================================================== */}

            <section className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">

                <div className="flex flex-wrap items-center gap-3 mb-6">

                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5" />
                    </div>

                    <div>

                        <h2 className="text-2xl font-bold">
                            Gallery
                        </h2>

                        <p className="text-sm text-gray-500">
                            Manage branch gallery images
                        </p>

                    </div>

                </div>

                <div className="space-y-4">

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setGalleryImage(
                                e.target.files?.[0] ||
                                null
                            )
                        }
                    />

                    <button
                        onClick={addGalleryImage}
                        disabled={galleryUploading}
                        className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-semibold transition"
                    >

                        {galleryUploading ? (
                            <>
                                <Upload className="w-4 h-4 animate-pulse" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Upload Photo
                            </>
                        )}

                    </button>

                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

                    {gallery.map((image) => (

                        <div
                            key={image.id}
                            className="relative group"
                        >

                            <img
                                src={image.image_url}
                                alt=""
                                className="w-full h-40 object-cover rounded-xl"
                            />

                            <button
                                onClick={() =>
                                    deleteGalleryImage(
                                        image.id
                                    )
                                }
                                className="absolute top-2 right-2 inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-xl transition opacity-90 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                            </button>

                        </div>

                    ))}

                </div>

            </section>

            {/* ==================================================
                ADD EVENT
            ================================================== */}

            <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-hidden">

                {/* =====================================================
        HEADER
    ====================================================== */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">

                    <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                            Add Event
                        </h2>

                        <p className="text-sm text-gray-500 mt-1 break-words">
                            Create a new church event
                        </p>
                    </div>

                </div>


                {/* =====================================================
        FORM
    ====================================================== */}
                <div className="grid gap-4 w-full min-w-0">

                    {/* Event Title */}
                    <input
                        className="w-full min-w-0 border border-gray-200 p-3.5 sm:p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Event title"
                        value={activity}
                        onChange={(e) =>
                            setActivity(e.target.value)
                        }
                    />


                    {/* Description */}
                    <textarea
                        className="w-full min-w-0 border border-gray-200 p-3.5 sm:p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-y"
                        rows={5}
                        placeholder="Event description..."
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                    />


                    {/* =================================================
            DATE & TIME
        ================================================== */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">

                        {/* Start */}
                        <div className="min-w-0 w-full">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date & Time
                            </label>

                            <input
                                type="datetime-local"
                                className="block w-full max-w-full min-w-0 border border-gray-200 p-3.5 sm:p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
                                value={eventDate}
                                onChange={(e) =>
                                    setEventDate(e.target.value)
                                }
                            />

                        </div>


                        {/* End */}
                        <div className="min-w-0 w-full">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date & Time
                            </label>

                            <input
                                type="datetime-local"
                                className="block w-full max-w-full min-w-0 border border-gray-200 p-3.5 sm:p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
                                value={endDate}
                                onChange={(e) =>
                                    setEndDate(e.target.value)
                                }
                            />

                        </div>

                    </div>


                    {/* Live Stream URL */}
                    <input
                        className="w-full min-w-0 border border-gray-200 p-3.5 sm:p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Live stream URL (optional)"
                        value={liveUrl}
                        onChange={(e) =>
                            setLiveUrl(e.target.value)
                        }
                    />


                    {/* =================================================
            IMAGE UPLOAD
        ================================================== */}
                    <div className="w-full min-w-0">

                        <p className="text-sm font-medium text-gray-700 mb-3">
                            Event Background Image
                        </p>

                        <div className="w-full min-w-0">

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    handleFile(
                                        e.target.files?.[0] || null
                                    )
                                }
                                className="block w-full max-w-full text-sm text-gray-500
                        file:mr-3
                        file:py-2.5
                        file:px-4
                        file:rounded-xl
                        file:border-0
                        file:text-sm
                        file:font-semibold
                        file:bg-blue-50
                        file:text-blue-700
                        hover:file:bg-blue-100
                        file:cursor-pointer"
                            />

                        </div>

                    </div>


                    {/* =================================================
            IMAGE PREVIEW
        ================================================== */}
                    {imagePreview && (

                        <div className="w-full min-w-0">

                            <img
                                src={imagePreview}
                                alt="Event preview"
                                className="w-full h-40 sm:h-56 lg:h-64 rounded-2xl object-cover border border-gray-200"
                            />

                        </div>

                    )}


                    {/* =================================================
            SUBMIT
        ================================================== */}
                    <button
                        disabled={uploading}
                        onClick={addActivity}
                        className="mt-2 w-full min-w-0 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base"
                    >

                        {uploading ? (
                            <>
                                <Upload className="w-4 h-4 animate-pulse shrink-0" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 shrink-0" />
                                <span>Add Event</span>
                            </>
                        )}

                    </button>

                </div>

            </section>

            {/* ==================================================
                EVENTS LIST
            ================================================== */}

            <section className="space-y-5">

                <div className="flex items-center justify-between">

                    <div>

                        <h2 className="text-2xl font-bold text-black dark:text-gray-100">
                            Events
                        </h2>

                        <p className="text-sm text-black dark:text-gray-100 mt-1">
                            Manage events for the selected branch
                        </p>

                    </div>

                    <span className="text-sm text-black dark:text-gray-100">
                        {activities.length} total
                    </span>

                </div>

                {activities.length === 0 ? (

                    <div className="rounded-3xl border border-white/30 bg-white/30 backdrop-blur-xl p-10 text-center">

                        <CalendarDays className="w-10 h-10 mx-auto text-black dark:text-gray-100 mb-4" />

                        <p className="text-black dark:text-gray-100 font-semibold">
                            No events yet
                        </p>

                        <p className="text-sm text-black dark:text-gray-100 mt-1">
                            Add an event above to get started.
                        </p>

                    </div>

                ) : (

                    activities.map((event) => {

                        const stats =
                            rsvpStats[event.id] || {
                                yes: 0,
                                no: 0,
                            };

                        return (

                            <div
                                key={event.id}
                                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl"
                            >

                                {/* IMAGE */}

                                <div
                                    className="h-48 bg-cover bg-center"
                                    style={{
                                        backgroundImage:
                                            `url(${
    event.image_url ||
    "https://images.unsplash.com/photo-1507692049790-de58290a4334"
})`,
                                    }}
                                />

                                {/* CONTENT */}

                                <div className="p-6">

                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                                        <div className="flex-1">

                                            <h3 className="text-2xl font-bold text-white">
                                                {event.title}
                                            </h3>

                                            <p className="text-white/70 mt-3 leading-relaxed">
                                                {event.description ||
                                                    "No description yet."}
                                            </p>

                                            <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">

                                                <div className="bg-white/10 rounded-2xl p-4">

                                                    <p className="flex items-center gap-2 text-white/50 uppercase text-xs tracking-widest mb-1">
                                                        <CalendarDays className="w-3.5 h-3.5" />
                                                        Starts
                                                    </p>

                                                    <p className="text-white font-medium">
                                                        {new Date(
                                                            event.event_date
                                                        ).toLocaleString()}
                                                    </p>

                                                </div>

                                                {event.end_date && (

                                                    <div className="bg-white/10 rounded-2xl p-4">

                                                        <p className="flex items-center gap-2 text-white/50 uppercase text-xs tracking-widest mb-1">
                                                            <CalendarDays className="w-3.5 h-3.5" />
                                                            Ends
                                                        </p>

                                                        <p className="text-white font-medium">
                                                            {new Date(
                                                                event.end_date
                                                            ).toLocaleString()}
                                                        </p>

                                                    </div>

                                                )}

                                            </div>

                                            {/* RSVP */}

                                            <div className="flex flex-wrap gap-4 mt-5">

                                                <div className="px-4 py-3 rounded-2xl bg-green-500/20 border border-green-400/20">

                                                    <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-green-300">

                                                        <CheckCircle2 className="w-4 h-4" />

                                                        YES RSVP

                                                    </p>

                                                    <p className="text-2xl font-bold text-white">
                                                        {stats.yes}
                                                    </p>

                                                </div>

                                                <div className="px-4 py-3 rounded-2xl bg-red-500/20 border border-red-400/20">

                                                    <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-red-300">

                                                        <XCircle className="w-4 h-4" />

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
                                                    setEditing(
                                                        event
                                                    )
                                                }
                                                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 transition font-semibold"
                                            >
                                                <Pencil className="w-4 h-4" />
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    deleteActivity(
                                                        event.id
                                                    )
                                                }
                                                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-500 hover:bg-red-400 transition text-white font-semibold"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        );
                    })

                )}

            </section>

            {/* ==================================================
                EDIT EVENT MODAL
            ================================================== */}

            {editing && (

                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">

                    <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                        {/* HEADER */}

                        <div className="flex items-center justify-between mb-6">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center">
                                    <Pencil className="w-5 h-5" />
                                </div>

                                <div>

                                    <h2 className="text-2xl font-bold">
                                        Edit Event
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Update event information
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setEditing(null)
                                }
                                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>

                        </div>

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
                                onClick={updateActivity}
                                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 transition text-white px-4 py-4 w-full rounded-2xl font-semibold"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>

                            <button
                                onClick={() =>
                                    setEditing(null)
                                }
                                className="flex items-center justify-center gap-2 w-full py-3 text-gray-500 hover:text-gray-800 transition"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}