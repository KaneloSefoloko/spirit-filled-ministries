import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PostDetail() {
    const { id } = useParams();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadPost() {
            setLoading(true);

            const { data, error } = await supabase
                .from("posts")
                .select("*")
                .eq("id", id)
                .single();

            console.log("Post ID:", id);
            console.log("Post Data:", data);
            console.log("Post Error:", error);

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            setPost(data);
            setLoading(false);
        }

        loadPost();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-gray-500">Loading story...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-24 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4">
                    Story Not Found
                </p>

                <h1 className="text-3xl font-semibold mb-6">
                    We couldn't find this story.
                </h1>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 border border-black px-6 py-3 text-sm uppercase tracking-[0.2em] hover:bg-black hover:text-white transition"
                >
                    Back Home
                </Link>
            </div>
        );
    }

    return (
        <article className="bg-white">

            {/* HERO */}
            <section className="max-w-5xl mx-auto px-6 pt-20 pb-12">

                <p className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-4">
                    Ministry Impact
                </p>

                <h1 className="text-4xl lg:text-6xl font-semibold tracking-tight leading-tight text-black">
                    {post.title}
                </h1>

                <p className="mt-6 text-sm uppercase tracking-[0.25em] text-gray-500">
                    {new Date(post.created_at).toLocaleDateString("en-ZA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </p>
            </section>

            {/* IMAGE */}
            <section className="max-w-6xl mx-auto px-6">

                {post.cover_image ? (
                    <div className="overflow-hidden rounded-3xl">
                        <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                ) : (
                    <div className="aspect-[16/8] rounded-3xl bg-[#f8f6f2] flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-3">
                                Ministry Story
                            </p>
                            <div className="w-16 h-px bg-gray-300 mx-auto" />
                        </div>
                    </div>
                )}
            </section>

            {/* CONTENT */}
            <section className="max-w-3xl mx-auto px-6 py-16">

                {post.excerpt && (
                    <p className="text-xl leading-relaxed text-gray-700 mb-12 font-light">
                        {post.excerpt}
                    </p>
                )}

                <div className="space-y-6 text-lg leading-9 text-gray-800">
                    {post.content
                        .split("\n")
                        .filter((paragraph) => paragraph.trim() !== "")
                        .map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                </div>

                <div className="mt-16 pt-8 border-t border-gray-200">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-black hover:opacity-60 transition"
                    >
                        ← Back to Stories
                    </Link>
                </div>
            </section>
        </article>
    );
}