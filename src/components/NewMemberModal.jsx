import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useBranch } from "../context/BranchContext";

export default function NewMemberModal() {
    const { branch } = useBranch();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        const lastSeen = localStorage.getItem("newMemberPromptSeen");
        const now = Date.now();

        if (!lastSeen || now - lastSeen > 24 * 60 * 60 * 1000) {
            setTimeout(() => setOpen(true), 800);
            localStorage.setItem("newMemberPromptSeen", now);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.from("new_members").insert([
            {
                full_name: fullName,
                email,
                phone,
                branch_id: branch || null,
            },
        ]);

        setLoading(false);

        if (error) {
            if (error.code === "23505") {
                alert("This email is already registered. Thank you for joining!");
                setOpen(false);
                return;
            }

            console.error("Signup error:", error.message);
            alert("Something went wrong. Please try again.");
            return;
        }

        alert("Thank you for joining! We’ll be in touch soon.");
        setOpen(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            {/*<div*/}
            {/*    className="absolute inset-0 bg-black/50 backdrop-blur-sm"*/}
            {/*    onClick={() => setOpen(false)}*/}
            {/*/>*/}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
                style={{ touchAction: "none" }}
            />

            {/* Modal */}
            <div className="relative z-10 max-w-lg w-full mx-6">
                <div className="relative rounded-3xl bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl p-8 animate-fadeInUp">

                    {/* Close */}
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    >
                        ✕
                    </button>

                    <p className="text-xs uppercase tracking-[0.35em] text-purple-600 mb-2 text-center">
                        Welcome
                    </p>

                    <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-4">
                        New Here?
                    </h2>

                    <p className="text-sm text-gray-600 text-center mb-6">
                        Join our church family and stay connected.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full rounded-xl px-4 py-3 bg-white/70 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                        />

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-xl px-4 py-3 bg-white/70 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                        />

                        <input
                            type="tel"
                            placeholder="Phone (optional)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-xl px-4 py-3 bg-white/70 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-full bg-purple-600 hover:bg-purple-700 transition text-white font-semibold py-3 shadow-lg disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : "Join the Church"}
                        </button>
                    </form>

                    <p className="mt-4 text-xs text-gray-500 text-center">
                        We respect your privacy. No spam — ever.
                    </p>
                </div>
            </div>
        </div>
    );
}