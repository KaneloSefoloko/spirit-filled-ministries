import { HeartHandshake } from "lucide-react";

export default function Testimonies() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="max-w-2xl text-center">

                <HeartHandshake className="w-16 h-16 mx-auto mb-6 text-gray-400" />

                <p className="uppercase tracking-[0.4em] text-purple-600 text-xs mb-4">
                    Testimonies
                </p>

                <h1 className="text-4xl font-bold mb-4">
                    Stories of God's Faithfulness
                </h1>

                <p className="text-gray-600 text-lg leading-relaxed">
                    We believe every testimony tells of God's goodness and power.
                    This space will soon feature stories of healing, deliverance,
                    restoration, salvation, and transformed lives.
                </p>

                <div className="mt-10 bg-gradient-to-r from-sky-50 to-purple-50 rounded-2xl p-6 border border-purple-100">
                    <p className="font-medium text-gray-800">
                        “And they overcame by the blood of the Lamb and by the word of their testimony.”
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                        Revelation 12:11
                    </p>
                </div>

            </div>
        </div>
    );
}