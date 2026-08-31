import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function loadSession() {
            const {
                data,
                error,
            } = await supabase.auth.getSession();

            if (error) {
                console.error(
                    "❌ AuthContext session error:",
                    error
                );
            }

            if (!mounted) return;

            const currentSession = data?.session ?? null;

            setSession(currentSession);

            setLoading(false);
        }

        loadSession();

        const {
            data: {
                subscription,
            },
        } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {

                setSession(newSession);

                setLoading(false);
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const logout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error(
                "❌ Logout error:",
                error
            );
            return;
        }

        setSession(null);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                user: session?.user ?? null,
                isAdmin,
                loading,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}