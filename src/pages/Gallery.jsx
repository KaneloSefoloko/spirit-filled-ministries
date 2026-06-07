import { useEffect, useState } from "react";
import { useBranch } from "../context/BranchContext";
import { supabase } from "../lib/supabaseClient";

export default function Gallery() {
    const { branch } = useBranch();

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const heroImage =
        "https://res.cloudinary.com/dkwfi3iku/image/upload/f_auto,q_auto:best,w_2400/v1776697658/IMG_9252_jiufkn.jpg";

    useEffect(() => {
        if (!branch) return;

        async function loadGallery() {
            setLoading(true);

            const { data } = await supabase
                .from("gallery")
                .select("*")
                .eq("branch_id", branch);

            setImages(data || []);
            setLoading(false);
        }

        loadGallery();
    }, [branch]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-purple-50">

            {/* ================= HERO ================= */}
            <div className="relative h-[40vh] sm:h-[50vh] md:h-[55vh] lg:h-[60vh] overflow-hidden rounded-b-[2rem] md:rounded-b-[2.5rem]">

                <img
                    src={heroImage}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
                />

                <div className="absolute inset-0 bg-black/55"/>

                <div className="relative z-10 h-full flex items-center justify-center text-center px-6 pt-20 md:pt-32">
                    <div>
                        <p className="uppercase tracking-[0.45em] text-purple-500 text-xs mb-4">
                            Media
                        </p>

                        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                            Spirit Filled Moments
                        </h1>

                        <p className="mt-4 text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto px-4">
                            Capturing worship, revival, testimonies,
                            healing and life-changing encounters.
                        </p>
                    </div>
                </div>
            </div>

            {/* ================= CONTENT ================= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">

                {/* HEADER */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>
                        <p className="uppercase tracking-[0.35em] text-purple-600 text-xs mb-2">
                            Gallery
                        </p>

                        <h2 className="text-2xl md:text-4xl font-semibold">
                            Ministry Highlights
                        </h2>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-full px-5 py-3 shadow-md">
                        <span className="text-sm text-gray-600">
                            {images.length} Photos
                        </span>
                    </div>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="animate-pulse text-gray-400">
                            Loading gallery...
                        </div>
                    </div>
                )}

                {/* EMPTY */}
                {!loading && images.length === 0 && (
                    <div className="max-w-2xl mx-auto">

                        <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl shadow-lg p-10 text-center">

                            <div className="text-5xl mb-5">
                                📸
                            </div>

                            <h3 className="text-2xl font-semibold mb-3">
                                Gallery Coming Soon
                            </h3>

                            <p className="text-gray-600">
                                Photos from services, conferences,
                                outreach events and ministry activities
                                will appear here.
                            </p>

                        </div>

                    </div>
                )}

                {/* ================= MASONRY ================= */}
                {!loading && images.length > 0 && (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">

                        {images.map((image) => (
                            <div
                                key={image.id}
                                onClick={() => setSelectedImage(image.image_url)}
                                className="
                                    break-inside-avoid
                                    cursor-pointer
                                    overflow-hidden
                                    rounded-3xl
                                    shadow-lg
                                    bg-white
                                    group
                                "
                            >
                                <div className="relative overflow-hidden">

                                    <img
                                        src={image.image_url}
                                        alt=""
                                        loading="lazy"
                                        className="
                                            w-full
                                            h-auto
                                            object-cover
                                            transition-all
                                            duration-700
                                            group-hover:scale-105
                                        "
                                    />

                                    <div
                                        className="
                                            absolute inset-0
                                            bg-black/0
                                            group-hover:bg-black/20
                                            transition-all
                                            duration-500
                                        "
                                    />

                                    <div
                                        className="
                                            absolute inset-0
                                            flex items-center
                                            justify-center
                                            opacity-0
                                            group-hover:opacity-100
                                            transition-all
                                            duration-500
                                        "
                                    >
                                        <div
                                            className="
                                                px-5 py-2
                                                rounded-full
                                                bg-white/90
                                                backdrop-blur
                                                text-sm
                                                font-medium
                                            "
                                        >
                                            View Image
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ================= LIGHTBOX ================= */}
            {selectedImage && (
                <div
                    className="
                        fixed inset-0 z-50
                        bg-black/90
                        backdrop-blur-md
                        flex items-center
                        justify-center
                        p-4
                    "
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="
                            absolute
                            top-6
                            right-6
                            text-white
                            text-3xl
                        "
                    >
                        ✕
                    </button>

                    <img
                        src={selectedImage}
                        alt=""
                        className=" w-auto h-auto max-h-[85vh] max-w-[95vw] rounded-2xl shadow-2xl object-contain"
                    />
                </div>
            )}
        </div>
    );
}