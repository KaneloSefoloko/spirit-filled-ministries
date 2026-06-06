import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function checkUser() {
            const { data } = await supabase.auth.getSession();
            const session = data.session;

            if (!mounted) return;

            setSession(session);

            if (session?.user?.email) {
                // 🔥 CHECK AGAINST ADMIN TABLE
                const { data: admin, error } = await supabase
                    .from("admins")
                    .select("email")
                    .eq("email", session.user.email)
                    .single();

                if (!error && admin) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            }

            setLoading(false);
        }

        checkUser();

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);

                if (session?.user?.email) {
                    const { data: admin } = await supabase
                        .from("admins")
                        .select("email")
                        .eq("email", session.user.email)
                        .single();

                    setIsAdmin(!!admin);
                } else {
                    setIsAdmin(false);
                }
            }
        );

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-gray-900 font-bold">
                Checking access...
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/admin" />;
    }

    if (!isAdmin) {
        return (
            <div className="h-screen flex items-center justify-center text-red-500">
                Access denied (not admin)
            </div>
        );
    }

    return children;
}