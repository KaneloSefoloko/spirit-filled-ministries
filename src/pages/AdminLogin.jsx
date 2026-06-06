import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const login = async () => {
        if (!email || !password) {
            alert("Enter email & password");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            alert(error.message);
        } else {
            navigate("/admin/dashboard");
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#5e6069] flex items-center justify-center px-6">

            {/* PREMIUM BACKGROUND GLOWS */}
            <div className="absolute top-[-180px] left-[-120px] h-[420px] w-[420px] rounded-full bg-purple-600/20 blur-3xl" />

            <div className="absolute bottom-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-sky-500/20 blur-3xl" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_45%)]" />

            {/* CARD */}
            <div
                className="
                    relative
                    w-full
                    max-w-md
                    rounded-[32px]
                    border
                    border-white/10
                    bg-white/8
                    backdrop-blur-2xl
                    shadow-[0_10px_60px_rgba(0,0,0,0.55)]
                    p-10
                "
            >

                {/* TOP LINE */}
                <div className="mb-8 text-center">

                    <div className="inline-flex items-center justify-center px-4 py-1 rounded-full border border-white/10 bg-white/5 mb-5">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-gray-300 font-medium">
                            Secure Access
                        </span>
                    </div>

                    <h1 className="text-4xl font-[Poppins] font-semibold tracking-tight text-white mb-3">
                        Admin Portal
                    </h1>

                    <p className="text-sm leading-relaxed tracking-wide text-gray-200 max-w-sm mx-auto">
                        Sign in to manage events, livestreams, branches,
                        media and ministry content.
                    </p>
                </div>

                {/* EMAIL */}
                <div className="mb-4">
                    <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-3">
                        Email Address
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="
                            w-full
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            px-5
                            py-4
                            text-white
                            placeholder:text-gray-500
                            outline-none
                            backdrop-blur-md
                            transition-all
                            duration-300
                            focus:border-purple-400/40
                            focus:bg-white/10
                            focus:ring-4
                            focus:ring-purple-500/10
                        "
                    />
                </div>

                {/* PASSWORD */}
                <div className="mb-7">
                    <label className="block text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-3">
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="
                            w-full
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            px-5
                            py-4
                            text-white
                            placeholder:text-gray-500
                            outline-none
                            backdrop-blur-md
                            transition-all
                            duration-300
                            focus:border-purple-400/40
                            focus:bg-white/10
                            focus:ring-4
                            focus:ring-purple-500/10
                        "
                    />
                </div>

                {/* BUTTON */}
                <button
                    onClick={login}
                    disabled={loading}
                    className="
                        group
                        relative
                        w-full
                        overflow-hidden
                        rounded-2xl
                        py-4
                        font-medium
                        tracking-wide
                        text-white
                        transition-all
                        duration-300
                        bg-gradient-to-r
                        from-sky-500
                        via-purple-500
                        to-purple-700
                        hover:scale-[1.015]
                        hover:shadow-[0_10px_30px_rgba(139,92,246,0.35)]
                        disabled:opacity-60
                        disabled:cursor-not-allowed
                    "
                >

                    <span className="relative z-10">
                        {loading ? "Logging in..." : "Access Dashboard"}
                    </span>

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/10" />
                </button>

                {/* FOOTER */}
                <div className="mt-6 text-center">
                    <p className="text-xs tracking-wide text-gray-200">
                        Protected ministry administration system
                    </p>
                </div>

            </div>
        </div>
    );
}