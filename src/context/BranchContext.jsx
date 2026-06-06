import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const BranchContext = createContext();

export function BranchProvider({ children }) {
    const [branch, setBranch] = useState(null);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            const saved = localStorage.getItem("branch");

            const { data, error } = await supabase
                .from("branches")
                .select("*");

            if (!error && data) {
                setBranches(data);

                if (saved && data.find(b => b.id === saved)) {
                    setBranch(saved);
                } else if (data.length > 0) {
                    setBranch(data[0].id);
                    localStorage.setItem("branch", data[0].id);
                }
            }

            setLoading(false);
        }

        init();
    }, []);

    useEffect(() => {
        if (branch) {
            localStorage.setItem("branch", branch);
        }
    }, [branch]);

    return (
        <BranchContext.Provider value={{ branch, setBranch, branches, loading }}>
            {children}
        </BranchContext.Provider>
    );
}

export function useBranch() {
    return useContext(BranchContext);
}