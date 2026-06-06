import { useEffect, useState } from "react";
import { useBranch } from "../context/BranchContext";
import { supabase } from "../lib/supabaseClient";

export default function Live() {
    const { branch } = useBranch();
    const [branchData, setBranchData] = useState(null);

    // Load initial data
    useEffect(() => {
        if (!branch) return;

        async function load() {
            const { data } = await supabase
                .from("branches")
                .select("*")
                .eq("id", branch)
                .single();

            setBranchData(data);
        }

        load();
    }, [branch]);

    // 🔥 Realtime updates
    useEffect(() => {
        if (!branch) return;

        const channel = supabase
            .channel("branch-live")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "branches",
                    filter: `id=eq.${branch}`,
                },
                (payload) => {
                    setBranchData(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [branch]);

    // ✅ Facebook embed formatting
    const embedUrl = branchData?.live_url
        ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
            branchData.live_url
        )}&show_text=false&autoplay=true`
        : null;

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 text-center">
            <h1 className="text-xl font-bold uppercase tracking-[0.35em] text-purple-700">
                Live Service - {branchData?.name}
            </h1>

            <div className="mt-6 bg-black rounded-xl overflow-hidden shadow-lg">
                {embedUrl ? (
                    <iframe
                        className="w-full h-[500px]"
                        src={embedUrl}
                        allowFullScreen
                    />
                ) : (
                    <div className="text-white p-10">
                        No live stream available yet.
                    </div>
                )}
            </div>
        </div>
    );
}