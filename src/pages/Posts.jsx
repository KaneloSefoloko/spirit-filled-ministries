import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import BlogSection from "../components/BlogSection";

export default function Posts() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        supabase
            .from("posts")
            .select("*")
            .eq("published", true)
            .order("created_at", { ascending: false })
            .then(({ data }) => setPosts(data || []));
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-6 py-20">
            <BlogSection posts={posts} />
        </div>
    );
}