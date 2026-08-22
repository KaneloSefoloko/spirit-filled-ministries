import {BookOpen} from "lucide-react";
import {NavLink} from "react-router-dom";

export default function Sermons() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="max-w-2xl text-center">

                <BookOpen className="w-16 h-16 mx-auto mb-6 text-gray-400"/>

                <p className="uppercase tracking-[0.4em] text-purple-600 text-xs mb-4">
                    Sermons
                </p>

                <h1 className="text-4xl font-bold mb-4">
                    Messages Coming Soon
                </h1>

                <p className="text-gray-600 text-lg leading-relaxed">
                    We're currently preparing our sermon library. Soon you'll be
                    able to watch, listen to, and revisit powerful teachings,
                    deliverance sessions, and ministry messages from Spirit Filled Ministries.
                </p>

                <div className="mt-10">
                    <NavLink
                        to="/live"
                        className="inline-flex items-center rounded-full bg-purple-600 px-6 py-3 text-white hover:bg-purple-700 transition"
                    >
                        Watch Live Services
                    </NavLink>
                </div>

            </div>

        </div>);
}