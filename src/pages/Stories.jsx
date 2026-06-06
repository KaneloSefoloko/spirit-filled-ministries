import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Stories() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStories() {
            const { data } = await supabase
                .from("posts")
                .select("*")
                .eq("published", true)
                .order("created_at", { ascending: false });

            setPosts(data || []);
            setLoading(false);
        }

        loadStories();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading stories...</p>
            </div>
        );
    }

    if (!posts.length) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">No stories available.</p>
            </div>
        );
    }

    const [featured, ...rest] = posts;

    return (
        <div className="bg-white">

            {/* HERO */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-20">

                <p className="text-xs uppercase tracking-[0.45em] text-gray-500 mb-5">
                    Ministry Impact
                </p>

                <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight text-black leading-none">
                    Success Stories
                </h1>

                <p className="mt-8 max-w-3xl text-lg text-gray-600 leading-relaxed">
                    Celebrating transformed lives, community outreach,
                    education initiatives, conferences, and the ongoing
                    work of God through Spirit Filled Ministries.
                </p>
            </section>

            {/* FEATURED STORY */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">

                <Link
                    to={`/posts/${featured.id}`}
                    className="group block"
                >
                    <div className="grid lg:grid-cols-2 gap-12 items-center">

                        <div className="overflow-hidden rounded-3xl bg-[#f8f6f2]">

                            {featured.cover_image ? (
                                <img
                                    src={featured.cover_image}
                                    alt={featured.title}
                                    className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="aspect-[16/10] flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">
                                            Featured Story
                                        </p>
                                        <div className="w-16 h-px bg-gray-300 mx-auto" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4">
                                Featured Story
                            </p>

                            <h2 className="text-4xl lg:text-5xl font-semibold leading-tight text-black group-hover:opacity-70 transition">
                                {featured.title}
                            </h2>

                            {featured.excerpt && (
                                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                                    {featured.excerpt}
                                </p>
                            )}

                            <div className="mt-8 flex items-center gap-3 text-sm uppercase tracking-[0.25em]">
                                Read Story →
                            </div>
                        </div>
                    </div>
                </Link>
            </section>

            {/* ALL STORIES */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-32">

                <div className="border-t border-gray-200 pt-16 mb-12">
                    <h3 className="text-2xl font-semibold">
                        More Stories
                    </h3>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">

                    {rest.map((post) => (
                        <Link
                            key={post.id}
                            to={`/posts/${post.id}`}
                            className="group"
                        >
                            <article>

                                <div className="overflow-hidden rounded-2xl bg-[#f8f6f2]">

                                    {post.cover_image ? (
                                        <img
                                            src={post.cover_image}
                                            alt={post.title}
                                            className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="aspect-[4/3] flex items-center justify-center">
                                            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
                                                Ministry Story
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-5">

                                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                                        {new Date(
                                            post.created_at
                                        ).toLocaleDateString("en-ZA", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>

                                    <h4 className="text-xl font-medium leading-snug text-black group-hover:opacity-70 transition">
                                        {post.title}
                                    </h4>

                                    {post.excerpt && (
                                        <p className="mt-3 text-gray-600 leading-relaxed line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                    )}
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}