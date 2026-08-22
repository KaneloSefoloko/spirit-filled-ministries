import { BookOpen, Smartphone, ArrowRight } from "lucide-react";

export default function Resources() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-6xl mx-auto px-6 py-32">

                <div className="text-center mb-16">
                    <p className="uppercase tracking-[0.4em] text-purple-600 text-xs mb-4">
                        Resources
                    </p>

                    <h1 className="text-5xl font-bold mb-4">
                        Grow In God's Word
                    </h1>

                    <p className="max-w-2xl mx-auto text-gray-600">
                        Helpful tools and resources to strengthen your faith,
                        understand Scripture, and deepen your walk with Christ.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* How To Read The Bible */}
                    <a
                        href="https://bibleproject.com/videos/collections/how-to-read-the-bible/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white rounded-3xl border border-gray-200 p-10 hover:shadow-xl transition-all duration-300"
                    >
                        <BookOpen className="w-12 h-12 mb-12 text-black" />

                        <p className="uppercase tracking-[0.3em] text-xs text-gray-500 mb-3">
                            Bible Project
                        </p>

                        <h2 className="text-3xl font-bold mb-4">
                            How To Read The Bible
                        </h2>

                        <p className="text-gray-600 mb-10">
                            Discover how the Bible is designed, how each book fits
                            into the larger story, and how to read Scripture with
                            confidence.
                        </p>

                        <div className="flex items-center gap-2 uppercase tracking-widest font-semibold">
                            Explore
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </a>

                    {/* Bible App */}
                    <a
                        href="https://www.bible.com/app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white rounded-3xl border border-gray-200 p-10 hover:shadow-xl transition-all duration-300"
                    >
                        <Smartphone className="w-12 h-12 mb-12 text-black" />

                        <p className="uppercase tracking-[0.3em] text-xs text-gray-500 mb-3">
                            YouVersion
                        </p>

                        <h2 className="text-3xl font-bold mb-4">
                            Bible App
                        </h2>

                        <p className="text-gray-600 mb-10">
                            Read the Bible anywhere, listen to audio versions,
                            follow reading plans, and stay connected to God's Word
                            every day.
                        </p>

                        <div className="flex items-center gap-2 uppercase tracking-widest font-semibold">
                            Open App
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </a>

                </div>
            </div>
        </div>
    );
}