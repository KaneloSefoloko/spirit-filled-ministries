import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        async function checkRecoverySession() {
            const { data } = await supabase.auth.getSession();

            if (!mounted) return;

            if (!data.session) {
                setError(
                    "This password reset link is invalid or has expired. Please request a new one."
                );
            }

            setCheckingSession(false);
        }

        checkRecoverySession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;

            if (event === "PASSWORD_RECOVERY" && session) {
                setError("");
                setCheckingSession(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!password || !confirmPassword) {
            setError("Please enter your new password.");
            return;
        }

        if (password.length < 6) {
            setError("Your password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        const { error: updateError } = await supabase.auth.updateUser({
            password,
        });

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
            return;
        }

        setMessage(
            "Your password has been successfully updated. You can now sign in."
        );

        setPassword("");
        setConfirmPassword("");
        setLoading(false);

        setTimeout(() => {
            navigate("/admin");
        }, 2000);
    };

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />

                    <p className="text-gray-600 font-medium">
                        Verifying password reset link...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-20">
            <div className="w-full max-w-md">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 sm:p-10">
                    {/* HEADER */}
                    <div className="text-center mb-8">
                        <p className="text-xs uppercase tracking-[0.3em] text-purple-600 font-semibold mb-3">
                            Admin Portal
                        </p>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Reset Password
                        </h1>

                        <p className="text-gray-500 mt-3 text-sm">
                            Create a new password for your administrator account.
                        </p>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                            {error}

                            {error.includes("invalid") ||
                            error.includes("expired") ? (
                                <button
                                    type="button"
                                    onClick={() => navigate("/admin")}
                                    className="block mt-3 font-semibold underline"
                                >
                                    Return to Admin Login
                                </button>
                            ) : null}
                        </div>
                    )}

                    {/* SUCCESS */}
                    {message && (
                        <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                            {message}
                        </div>
                    )}

                    {/* FORM */}
                    {!error.includes("invalid") &&
                        !error.includes("expired") && (
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter new password"
                                        autoComplete="new-password"
                                        className="w-full border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>

                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        placeholder="Confirm new password"
                                        autoComplete="new-password"
                                        className="w-full border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-300 transition text-white px-6 py-4 rounded-2xl font-semibold"
                                >
                                    {loading
                                        ? "Updating Password..."
                                        : "Update Password"}
                                </button>
                            </form>
                        )}

                    {/* BACK TO LOGIN */}
                    <button
                        type="button"
                        onClick={() => navigate("/admin")}
                        className="w-full mt-6 text-sm text-gray-500 hover:text-purple-600 transition"
                    >
                        ← Back to Admin Login
                    </button>
                </div>
            </div>
        </div>
    );
}