import {
    BarChart3,
    BookOpen,
    Calendar,
    CalendarDays,
    Circle,
    CircleCheck,
    Globe2,
    ListChecks,
    PauseCircle,
    Pencil,
    Rocket,
    Trash2,
} from "lucide-react";

export default function QuizCard({
                                     quiz,
                                     onManage,
                                     onEdit,
                                     onDelete,
                                     onStatistics,
                                     onPublish,
                                     onDeactivate,
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

                {/* =====================================================
                    LEFT SIDE
                ====================================================== */}

                <div className="flex-1">

                    {/* Quiz Header */}

                    <div className="flex items-center gap-3 flex-wrap">

                        <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl">
                            <BookOpen className="w-7 h-7 text-purple-600" />
                        </div>

                        <div>

                            <h3 className="text-2xl font-bold text-gray-900">
                                {quiz.title}
                            </h3>

                            <p className="text-gray-500 mt-1">
                                {quiz.description || "No description provided."}
                            </p>

                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">

                            {quiz.is_active ? (
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold flex items-center gap-1.5">
                                    <CircleCheck className="w-4 h-4" />
                                    Active
                                </span>
                            ) : quiz.published_at ? (
                                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center gap-1.5">
                                    <Globe2 className="w-4 h-4" />
                                    Published
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold flex items-center gap-1.5">
                                    <Circle className="w-4 h-4" />
                                    Draft
                                </span>
                            )}

                        </div>

                    </div>


                    {/* Quiz Meta */}

                    <div className="mt-6 flex flex-wrap gap-3">

                        <span
                            className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium flex items-center gap-2">
                            <CalendarDays className="w-4 h-4"/>
                            Week {quiz.week_number ?? "-"}
                        </span>

                        <span
                            className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4"/>
                            {quiz.year ?? "-"}
                        </span>

                        {/* Published Status */}

                        <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                                quiz.published_at
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-orange-100 text-orange-700"
                            }`}
                        >
                             {quiz.published_at ? (
                                 <>
                                     <Globe2 className="w-4 h-4" />
                                     Published
                                 </>
                             ) : (
                                 <>
                                     <Pencil className="w-4 h-4" />
                                     Draft
                                 </>
                             )}
                        </span>

                    </div>


                    {/* Dates */}

                    <div className="mt-6 grid md:grid-cols-2 gap-4">

                        <div className="bg-gray-50 rounded-2xl p-4">

                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Starts
                            </p>

                            <p className="font-semibold mt-1 text-gray-900">
                                {formatDate(quiz.start_date)}
                            </p>

                        </div>


                        <div className="bg-gray-50 rounded-2xl p-4">

                            <p className="text-xs uppercase tracking-wide text-gray-400">
                                Ends
                            </p>

                            <p className="font-semibold mt-1 text-gray-900">
                                {formatDate(quiz.end_date)}
                            </p>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    RIGHT SIDE
                ====================================================== */}

                <div className="flex flex-col gap-3 min-w-[220px]">

                    {/* Manage Questions */}

                    <button
                        onClick={() => onManage(quiz)}
                        className="bg-sky-600 hover:bg-sky-500 text-white rounded-xl py-3 font-semibold transition"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <ListChecks className="w-5 h-5"/>
                                Manage Questions
                        </span>
                    </button>


                    {/* Edit Quiz */}

                    <button
                        onClick={() => onEdit(quiz)}
                        className="bg-amber-500 hover:bg-amber-400 text-white rounded-xl py-3 font-semibold transition"
                    >
                        <span className="flex items-center justify-center gap-2">
                             <Pencil className="w-5 h-5" />
                                 Edit Quiz
                        </span>
                    </button>


                    {/* Statistics */}

                    <button
                        onClick={() => onStatistics(quiz)}
                        className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold transition"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                                Statistics
                        </span>
                    </button>


                    {/* Delete */}

                    <button
                        onClick={() => onDelete(quiz)}
                        className="bg-red-600 hover:bg-red-500 text-white rounded-xl py-3 font-semibold transition"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Trash2 className="w-5 h-5" />
                              Delete Quiz
                        </span>
                    </button>

                    {/* =====================================================
                     PUBLISH / DEACTIVATE
                     ====================================================== */}

                    {quiz.published_at && quiz.is_active ? (
                        <button
                            onClick={() => onDeactivate(quiz)}
                            className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-3 rounded-xl font-semibold transition"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <PauseCircle className="w-5 h-5" />
                                Deactivate
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={() => onPublish(quiz)}
                            className="bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-xl font-semibold transition"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Rocket className="w-5 h-5" />
                                Publish Quiz
                            </span>
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}