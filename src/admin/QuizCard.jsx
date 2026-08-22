export default function QuizCard({
                                     quiz,
                                     onManage,
                                     onEdit,
                                     onDelete,
                                 }) {
    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 p-7">

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">

                {/* Left Side */}

                <div className="flex-1">

                    <div className="flex items-center gap-3 flex-wrap">

                        <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl">
                            📖
                        </div>

                        <div>

                            <h3 className="text-2xl font-bold text-gray-900">
                                {quiz.title}
                            </h3>

                            <p className="text-gray-500 mt-1">
                                {quiz.description || "No description provided."}
                            </p>

                        </div>

                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">

                        <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                            📅 Week {quiz.week_number ?? "-"}
                        </span>

                        <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                            📆 {quiz.year}
                        </span>

                        <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                quiz.is_active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-200 text-gray-600"
                            }`}
                        >
                            {quiz.is_active ? "🟢 Active" : "⚪ Inactive"}
                        </span>

                    </div>

                    <div className="mt-6 grid md:grid-cols-2 gap-4">

                        <div className="bg-gray-50 rounded-2xl p-4">

                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Starts
                            </p>

                            <p className="font-semibold mt-1">
                                {formatDate(quiz.start_date)}
                            </p>

                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4">

                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Ends
                            </p>

                            <p className="font-semibold mt-1">
                                {formatDate(quiz.end_date)}
                            </p>

                        </div>

                    </div>

                </div>

                {/* Right Side */}

                <div className="flex flex-col gap-3 min-w-[220px]">

                    <button
                        onClick={onManage}
                        className="bg-sky-600 hover:bg-sky-500 text-white rounded-xl py-3 font-semibold transition"
                    >
                        📝 Manage Questions
                    </button>

                    <button
                        onClick={onEdit}
                        className="bg-amber-500 hover:bg-amber-400 text-white rounded-xl py-3 font-semibold transition"
                    >
                        ✏️ Edit Quiz
                    </button>

                    <button
                        disabled
                        className="bg-gray-100 text-gray-400 rounded-xl py-3 font-semibold cursor-not-allowed"
                    >
                        📊 Statistics
                        <span className="block text-xs mt-1">
                            Coming Soon
                        </span>
                    </button>

                    <button
                        onClick={onDelete}
                        className="bg-red-600 hover:bg-red-500 text-white rounded-xl py-3 font-semibold transition"
                    >
                        🗑 Delete Quiz
                    </button>

                </div>

            </div>

        </div>
    );
}