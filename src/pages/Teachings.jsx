import { Mic } from "lucide-react";

export default function Teachings() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="max-w-2xl text-center">

                <Mic className="w-16 h-16 mx-auto mb-6 text-gray-400" />

                <p className="uppercase tracking-[0.4em] text-purple-600 text-xs mb-4">
                    Teachings
                </p>

                <h1 className="text-4xl font-bold mb-4">
                    Growing in God's Word
                </h1>

                <p className="text-gray-600 text-lg leading-relaxed">
                    Our teaching library is being prepared. Soon you'll be able to
                    explore biblical teachings, practical ministry insights,
                    deliverance resources, and lessons designed to strengthen your walk
                    with Christ.
                </p>

                <div className="mt-10 p-6 bg-gray-50 rounded-2xl">
                    <p className="font-medium mb-3">
                        Coming Soon
                    </p>

                    <div className="space-y-2 text-gray-600">
                        <p>📖 Foundations of Faith</p>
                        <p>🔥 Deliverance Teachings</p>
                        <p>💙 Healing & Restoration</p>
                        <p>🙏 Christian Living</p>
                    </div>
                </div>

            </div>
        </div>
    );
}