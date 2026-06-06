import { useEffect, useState, useRef } from "react";
import { useBranch } from "../context/BranchContext";
import { supabase } from "../lib/supabaseClient";

export default function Live() {
    const { branch } = useBranch();

    const [branchData, setBranchData] = useState(null);
    const [showMiniPlayer, setShowMiniPlayer] = useState(false);

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const bottomRef = useRef();

    /* ========================
       LOAD DATA
    ======================== */
    useEffect(() => {
        if (!branch) return;

        async function load() {
            const { data } = await supabase
                .from("branches")
                .select("*")
                .eq("id", branch)
                .single();

            setBranchData(data);

            const { data: msgs } = await supabase
                .from("live_chat_messages")
                .select("*")
                .eq("branch_id", branch)
                .order("created_at", { ascending: true });

            setMessages(msgs || []);
        }

        load();
    }, [branch]);

    /* ========================
       REALTIME CHAT
    ======================== */
    useEffect(() => {
        if (!branch) return;

        const channel = supabase
            .channel("live-chat")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "live_chat_messages",
                    filter: `branch_id=eq.${branch}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [branch]);

    /* ========================
       AUTO SCROLL CHAT
    ======================== */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* ========================
       MINI PLAYER ON SCROLL
    ======================== */
    useEffect(() => {
        const handleScroll = () => {
            setShowMiniPlayer(window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    /* ========================
       VIDEO LOGIC (LIVE + REPLAY)
    ======================== */
    const videoUrl =
        branchData?.live_url || branchData?.replay_url;

    const embedUrl = videoUrl
        ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
            videoUrl
        )}&show_text=false`
        : null;

    /* ========================
       SEND MESSAGE
    ======================== */
    const sendMessage = async () => {
        if (!text.trim()) return;

        await supabase.from("live_chat_messages").insert({
            branch_id: branch,
            user_name: "Guest",
            message: text,
        });

        setText("");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

            {/* ================= HEADER ================= */}
            <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold text-purple-700">
                    Live Service - {branchData?.name}
                </h1>

                {/* LIVE */}
                {branchData?.live_url && (
                    <div className="mt-3 flex justify-center gap-3 items-center text-sm flex-wrap">
            <span className="px-3 py-1 bg-red-600 text-white rounded-full animate-pulse">
              🔴 LIVE
            </span>
                        <span className="text-gray-500">
              Service is currently streaming
            </span>
                    </div>
                )}

                {/* REPLAY */}
                {!branchData?.live_url && branchData?.replay_url && (
                    <div className="mt-3">
            <span className="px-3 py-1 bg-gray-800 text-white text-xs rounded-full">
              🎥 Replay Available
            </span>
                    </div>
                )}
            </div>

            {/* ================= LAYOUT ================= */}
            <div className="grid gap-6 lg:grid-cols-3">

                {/* VIDEO */}
                <div className="lg:col-span-2 bg-black rounded-2xl overflow-hidden shadow-lg">

                    <div className="relative w-full aspect-video">

                        <iframe
                            src={embedUrl}
                            className="absolute top-0 left-0 w-full h-full"
                            style={{ border: "none" }}
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            allowFullScreen
                            scrolling="no"
                        />

                    </div>

                    <div className="flex justify-between items-center p-3 bg-black text-white text-xs">
            <span className="text-gray-300">
              Watching service
            </span>

                        <a
                            href={videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                        >
                            Watch on Facebook →
                        </a>
                    </div>
                </div>

                {/* ================= CHAT ================= */}
                <div className="bg-white rounded-2xl shadow-lg flex flex-col h-[500px]">

                    <div className="p-4 border-b font-semibold">
                        Live Chat
                    </div>

                    {/* MESSAGES */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
                        {messages.map((m) => (
                            <div key={m.id}>
                <span className="font-semibold text-purple-600">
                  {m.user_name}:
                </span>{" "}
                                {m.message}
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* INPUT */}
                    <div className="p-3 border-t flex gap-2">
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type message..."
                            className="flex-1 border p-2 rounded-lg text-sm"
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />

                        <button
                            onClick={sendMessage}
                            className="bg-purple-600 text-white px-4 rounded-lg"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= MINI PLAYER ================= */}
            {embedUrl && showMiniPlayer && (
                <div className="fixed bottom-4 right-4 w-64 sm:w-72 aspect-video bg-black rounded-xl shadow-2xl z-50 overflow-hidden border">

                    <button
                        onClick={() => setShowMiniPlayer(false)}
                        className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-50"
                    >
                        ✕
                    </button>
                    <iframe
                        src={embedUrl}
                        className="absolute top-0 left-0 w-full h-full"
                        style={{ border: "none" }}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        allowFullScreen
                        scrolling="no"
                    />

                </div>
            )}
        </div>
    );
}