import { Link } from "react-router-dom";

export default function BlogSection({ posts }) {
    if (!posts || posts.length === 0) return null;

    const [featured, ...rest] = posts;
    const secondary = rest.slice(0, 4);

    return (
        <section className="w-full bg-white px-6 lg:px-12 xl:px-20 py-28">

            {/* HEADER */}
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-20">

                <div>
                    <p className="text-xs uppercase tracking-[0.45em] text-gray-500 mb-4">
                        Ministry Impact
                    </p>

                    <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-black">
                        Success Stories
                    </h2>

                    <p className="mt-5 text-gray-600 max-w-2xl leading-relaxed">
                        Celebrating lives transformed, communities served,
                        and the ongoing work of God through Spirit Filled Ministries.
                    </p>
                </div>

                <Link
                    to="/stories"
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-black border-b border-black pb-1 hover:opacity-60 transition"
                >
                    View All Stories
                </Link>
            </div>

            {/* MAIN GRID */}
            <div className="max-w-[1600px] mx-auto grid lg:grid-cols-3 gap-12 items-start">

                {/* FEATURED STORY */}
                <Link
                    to={`/posts/${featured.id}`}
                    className="lg:col-span-2 group"
                >
                    <article>

                        {/* IMAGE */}
                        <div className="aspect-[16/9] overflow-hidden bg-[#f8f6f2]">

                            {featured.cover_image ? (
                                <img
                                    src={featured.cover_image}
                                    alt={featured.title}
                                    className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-3">
                                            Featured Ministry Story
                                        </p>
                                        <div className="w-20 h-px bg-gray-300 mx-auto" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CONTENT */}
                        <div className="pt-8">

                            <p className="text-xs uppercase tracking-[0.35em] text-gray-500 mb-4">
                                {new Date(featured.created_at).toLocaleDateString(
                                    "en-ZA",
                                    {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    }
                                )}
                            </p>

                            <h3 className="text-3xl lg:text-4xl font-semibold leading-tight text-black group-hover:opacity-70 transition">
                                {featured.title}
                            </h3>

                            {featured.excerpt && (
                                <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-3xl">
                                    {featured.excerpt}
                                </p>
                            )}

                            <div className="mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-black">
                                Read Story →
                            </div>
                        </div>
                    </article>
                </Link>

                {/* SIDE STORIES */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-10">

                    {secondary.map((post) => (
                        <Link
                            key={post.id}
                            to={`/posts/${post.id}`}
                            className="group"
                        >
                            <article>

                                {/* IMAGE */}
                                <div className="aspect-[4/3] overflow-hidden bg-[#f8f6f2]">

                                    {post.cover_image ? (
                                        <img
                                            src={post.cover_image}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
                                                Success Story
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* CONTENT */}
                                <div className="pt-4">

                                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                                        {new Date(post.created_at).toLocaleDateString(
                                            "en-ZA",
                                            {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            }
                                        )}
                                    </p>

                                    <h4 className="text-lg font-medium leading-snug text-black group-hover:opacity-70 transition">
                                        {post.title}
                                    </h4>

                                    {post.excerpt && (
                                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                    )}
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}