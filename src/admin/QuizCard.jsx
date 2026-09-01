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

    const isPublished = Boolean(quiz.published_at);
    const isActive = Boolean(quiz.is_active);

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 p-7">

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">

                {/* =====================================================
                    LEFT SIDE
                ====================================================== */}

                <div className="flex-1">

                    {/* =================================================
                        QUIZ HEADER
                    ================================================= */}

                    <div className="flex items-start gap-3 flex-wrap">

                        <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                            <BookOpen className="w-7 h-7 text-purple-600" />
                        </div>

                        <div className="flex-1 min-w-0">

                            <h3 className="text-2xl font-bold text-gray-900 break-words">
                                {quiz.title}
                            </h3>

                            <p className="text-gray-500 mt-1">
                                {quiz.description || "No description provided."}
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        PRIMARY STATUS
                    ================================================= */}

                    <div className="flex flex-wrap gap-2 mt-5">

                        {isActive ? (

                            <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold flex items-center gap-1.5">
                                <CircleCheck className="w-4 h-4" />
                                Active
                            </span>

                        ) : isPublished ? (

                            <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center gap-1.5">
                                <Globe2 className="w-4 h-4" />
                                Published
                            </span>

                        ) : (

                            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold flex items-center gap-1.5">
                                <Circle className="w-4 h-4" />
                                Draft
                            </span>

                        )}

                    </div>


                    {/* =================================================
                        QUIZ META
                    ================================================= */}

                    <div className="mt-6 flex flex-wrap gap-3">

                        <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            Week {quiz.week_number ?? "-"}
                        </span>

                        <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {quiz.year ?? "-"}
                        </span>

                        <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                                isPublished
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-orange-100 text-orange-700"
                            }`}
                        >
                            {isPublished ? (
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


                    {/* =================================================
                        DATES
                    ================================================= */}

                    <div className="mt-6 grid sm:grid-cols-2 gap-4">

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

                <div className="flex flex-col gap-3 w-full lg:w-[240px] lg:min-w-[240px]">

                    {/* =================================================
                        MANAGE QUESTIONS
                    ================================================= */}

                    <button
                        onClick={() => onManage(quiz)}
                        className="bg-sky-600 hover:bg-sky-500 text-white rounded-xl py-3 px-4 font-semibold transition"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <ListChecks className="w-5 h-5" />
                            Manage Questions
                        </span>
                    </button>


                    {/* =================================================
                        EDIT QUIZ
                    ================================================= */}

                    <button
                        onClick={() => onEdit(quiz)}
                        className="bg-amber-500 hover:bg-amber-400 text-white rounded-xl py-3 px-4 font-semibold transition"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Pencil className="w-5 h-5" />
                            Edit Quiz
                        </span>
                    </button>


                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <button
                        onClick={() => onStatistics(quiz)}
                        className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 px-4 font-semibold transition"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Statistics
                        </span>
                    </button>


                    {/* =================================================
                        DELETE
                    ================================================= */}

                    <button
                        onClick={() => onDelete(quiz)}
                        className="bg-red-600 hover:bg-red-500 text-white rounded-xl py-3 px-4 font-semibold transition"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            Delete Quiz
                        </span>
                    </button>


                    {/* =================================================
                        PUBLISH / ACTIVATE / DEACTIVATE
                    ================================================= */}

                    {!isPublished ? (

                        /*
                         * DRAFT
                         *
                         * Publishing should set:
                         * published_at = current timestamp
                         *
                         * and should NOT automatically mean that
                         * the quiz becomes active unless the manager
                         * explicitly decides that.
                         */

                        <button
                            onClick={() => onPublish(quiz)}
                            className="bg-green-600 hover:bg-green-500 text-white rounded-xl py-3 px-4 font-semibold transition"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Rocket className="w-5 h-5" />
                                Publish Quiz
                            </span>
                        </button>

                    ) : isActive ? (

                        /*
                         * PUBLISHED + ACTIVE
                         */

                        <button
                            onClick={() => onDeactivate(quiz)}
                            className="bg-orange-500 hover:bg-orange-400 text-white rounded-xl py-3 px-4 font-semibold transition"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <PauseCircle className="w-5 h-5" />
                                Deactivate
                            </span>
                        </button>

                    ) : (

                        /*
                         * PUBLISHED + INACTIVE
                         */

                        <button
                            onClick={() => onPublish(quiz)}
                            className="bg-green-600 hover:bg-green-500 text-white rounded-xl py-3 px-4 font-semibold transition"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Rocket className="w-5 h-5" />
                                Activate Quiz
                            </span>
                        </button>

                    )}

                </div>

            </div>

        </div>
    );
}