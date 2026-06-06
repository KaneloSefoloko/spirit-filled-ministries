import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAdmin, setIsAdmin] = useState(() => {
        return localStorage.getItem("isAdmin") === "true";
    });

    const login = (password) => {
        // SIMPLE DEMO PASSWORD (replace later with real auth)
        if (password === "admin123") {
            setIsAdmin(true);
            localStorage.setItem("isAdmin", "true");
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAdmin(false);
        localStorage.removeItem("isAdmin");
    };

    return (
        <AuthContext.Provider value={{ isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}