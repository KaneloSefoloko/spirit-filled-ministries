import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { BookOpen, Trophy } from "lucide-react";

export default function BibleLeaderboard() {
    const [quizzes, setQuizzes] = useState([]);
    const [quiz, setQuiz] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // LOAD PUBLIC LEADERBOARD
    // =========================================================

    async function loadQuizResults(quizId) {
        try {
            setError("");

            const {
                data: resultData,
                error: resultError,
            } = await supabase
                .from("bible_quiz_leaderboard")
                .select(`
                id,
                quiz_id,
                display_name,
                branch_name,
                score,
                total_questions,
                percentage,
                completed_at
            `)
                .eq("quiz_id", quizId)
                .order("percentage", {
                    ascending: false,
                })
                .order("score", {
                    ascending: false,
                })
                .order("completed_at", {
                    ascending: true,
                });

            if (resultError) {
                throw resultError;
            }

            setResults(resultData || []);

        } catch (err) {
            console.error(
                "❌ Quiz results loading error:",
                err
            );

            setError(
                err?.message ||
                "Unable to load quiz results."
            );
        }
    }

    useEffect(() => {
        async function loadQuizzes() {
            try {
                setLoading(true);
                setError("");

                // -------------------------------------------------
                // GET QUIZZES FROM THE LAST 6 MONTHS
                // -------------------------------------------------

                const sixMonthsAgo = new Date();

                sixMonthsAgo.setMonth(
                    sixMonthsAgo.getMonth() - 6
                );

                const {
                    data: quizData,
                    error: quizError,
                } = await supabase
                    .from("bible_quizzes")
                    .select(`
                    id,
                    title,
                    description,
                    week_number,
                    year,
                    start_date,
                    end_date,
                    is_active,
                    created_at
                `)
                    .gte(
                        "end_date",
                        sixMonthsAgo.toISOString().split("T")[0]
                    )
                    .order("start_date", {
                        ascending: false,
                    });

                if (quizError) {
                    throw quizError;
                }

                const availableQuizzes = quizData || [];

                setQuizzes(availableQuizzes);

                // -------------------------------------------------
                // SELECT CURRENT QUIZ FIRST
                // -------------------------------------------------

                const today = new Date()
                    .toISOString()
                    .split("T")[0];

                const currentQuiz =
                    availableQuizzes.find(
                        (item) =>
                            item.is_active &&
                            item.start_date <= today &&
                            item.end_date >= today
                    ) ||
                    availableQuizzes[0] ||
                    null;

                setQuiz(currentQuiz);

                if (!currentQuiz) {
                    setResults([]);
                    return;
                }

                // -------------------------------------------------
                // LOAD RESULTS FOR SELECTED QUIZ
                // -------------------------------------------------

                await loadQuizResults(currentQuiz.id);

            } catch (err) {
                console.error(
                    "❌ Leaderboard loading error:",
                    err
                );

                setError(
                    err?.message ||
                    "Unable to load the leaderboard."
                );
            } finally {
                setLoading(false);
            }
        }

        loadQuizzes();
    }, []);

    // =========================================================
    // FORMAT DATE
    // =========================================================

    function formatDate(date) {
        if (!date) return "";

        return new Date(date).toLocaleString(
            "en-ZA",
            {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "short",
            }
        );
    }

    // =========================================================
    // RANK ICON
    // =========================================================

    function getRankDisplay(rank) {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";

        return rank;
    }

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <section className="min-h-[400px] bg-[#f7f7f9] flex items-center justify-center px-5">
                <div className="text-center">

                    <div className="relative w-12 h-12 mx-auto mb-5">
                        <div className="absolute inset-0 rounded-full border-4 border-purple-100" />

                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" />
                    </div>

                    <p className="text-sm font-medium text-gray-500">
                        Loading leaderboard...
                    </p>

                </div>
            </section>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <section className="py-16 px-5 bg-[#f7f7f9]">

                <div className="max-w-2xl mx-auto bg-white rounded-[28px] border border-red-100 p-8 text-center">

                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                        Unable to load leaderboard
                    </h2>

                    <p className="text-sm text-gray-500">
                        {error}
                    </p>

                </div>

            </section>
        );
    }

    // =========================================================
    // NO QUIZ
    // =========================================================

    if (!quiz) {
        return (
            <section className="py-20 px-5 bg-[#f7f7f9]">

                <div className="max-w-2xl mx-auto text-center">

                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">
                        <BookOpen className="w-10 h-10 mb-5 text-white"/>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900">
                        No Active Quiz
                    </h2>

                    <p className="mt-3 text-sm text-gray-500">
                        The leaderboard will appear when the next
                        Bible quiz is active.
                    </p>

                </div>

            </section>
        );
    }

    // =========================================================
    // LEADERBOARD
    // =========================================================

    return (
        <section className="min-h-screen bg-[#f7f7f9] text-gray-900">

            {/* =================================================
                HERO
            ================================================= */}

            <header className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-800 to-violet-900 text-white">

                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-fuchsia-400/20 blur-3xl" />

                <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-indigo-400/20 blur-3xl" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />

                <div className="relative max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-14 sm:py-20 text-center">

                    <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl backdrop-blur-sm">
                        <Trophy className="w-4 h-4" />
                    </div>

                    <p className="text-xs uppercase tracking-[0.3em] text-purple-200 font-semibold mb-4">
                        Bible Quiz
                    </p>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                        Leaderboard
                    </h1>

                    <p className="mt-4 text-sm sm:text-base text-white/70">
                        {quiz.title}
                    </p>

                </div>

            </header>

            {quizzes.length > 0 && (
                <div className="mb-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">

                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-purple-600">
                                    Quiz History
                                </p>

                                <h2 className="text-lg sm:text-xl font-bold text-gray-950 mt-1">
                                    Select a Quiz
                                </h2>
                            </div>

                            <select
                                value={quiz?.id || ""}
                                onChange={async (e) => {
                                    const selectedQuiz =
                                        quizzes.find(
                                            (item) =>
                                                item.id === e.target.value
                                        );

                                    if (!selectedQuiz) {
                                        return;
                                    }

                                    setQuiz(selectedQuiz);

                                    await loadQuizResults(
                                        selectedQuiz.id
                                    );
                                }}
                                className="
                        w-full sm:w-auto sm:min-w-[280px]
                        border border-gray-200
                        rounded-xl
                        px-4 py-3
                        bg-white
                        text-sm font-semibold text-gray-800
                        focus:outline-none
                        focus:ring-2
                        focus:ring-purple-500
                    "
                            >
                                {quizzes.map((item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.title}
                                    </option>
                                ))}
                            </select>

                        </div>

                    </div>
                </div>
            )}

            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-14">

                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">

                        <p className="text-2xl sm:text-3xl font-bold text-gray-950">
                            {results.length}
                        </p>

                        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-400 mt-1">
                            Participants
                        </p>

                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">

                        <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                            {results.length > 0
                                ? `${Math.round(
                                    results.reduce(
                                        (total, result) =>
                                            total +
                                            Number(result.percentage || 0),
                                        0
                                    ) / results.length
                                )}%`
                                : "0%"
                            }
                        </p>

                        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-400 mt-1">
                            Average
                        </p>

                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">

                        <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                            {results.length > 0
                                ? `${Number(
                                    results[0].percentage
                                ).toFixed(1)}%`
                                : "0%"
                            }
                        </p>

                        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-400 mt-1">
                            Highest
                        </p>

                    </div>

                </div>

                {/* =================================================
                    LEADERBOARD CARD
                ================================================= */}

                <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-gray-100 shadow-[0_15px_50px_rgba(15,23,42,0.07)] overflow-hidden">

                    {/* Header */}

                    <div className="px-5 sm:px-8 py-6 border-b border-gray-100">

                        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-purple-600">
                            Quiz Rankings
                        </p>

                        <h2 className="text-xl sm:text-2xl font-bold text-gray-950 mt-1">
                            Top Participants
                        </h2>

                    </div>

                    {/* Empty */}

                    {results.length === 0 ? (

                        <div className="px-6 py-16 text-center">

                            <div className="text-4xl mb-4">
                                <Trophy className="w-4 h-4" />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900">
                                No results yet
                            </h3>

                            <p className="text-sm text-gray-500 mt-2">
                                Be the first person to complete this
                                week's Bible quiz.
                            </p>

                        </div>

                    ) : (

                        <div>

                            {results.map(
                                (result, index) => {

                                    const rank = index + 1;

                                    return (
                                        <div
                                            key={result.id}
                                            className={`
                                                px-5 sm:px-8
                                                py-5
                                                border-b border-gray-100
                                                last:border-b-0
                                                transition-colors
                                                ${
                                                rank <= 3
                                                    ? "bg-purple-50/30"
                                                    : "hover:bg-gray-50"
                                            }
                                            `}
                                        >

                                            <div className="flex items-center gap-4">

                                                {/* Rank */}

                                                <div className="w-10 sm:w-12 shrink-0 text-center">

                                                    <span
                                                        className={
                                                            rank <= 3
                                                                ? "text-2xl"
                                                                : "text-sm font-bold text-gray-400"
                                                        }
                                                    >
                                                        {getRankDisplay(rank)}
                                                    </span>

                                                </div>

                                                {/* Participant */}

                                                <div className="flex-1 min-w-0">

                                                    <p className="font-bold text-gray-900 truncate">
                                                        {result.display_name}
                                                    </p>

                                                    <p className="text-xs text-gray-400 mt-1 truncate">
                                                        {result.branch_name}
                                                    </p>

                                                </div>

                                                {/* Score */}

                                                <div className="text-right shrink-0">

                                                    <p className="text-lg sm:text-xl font-bold text-gray-950">
                                                        {result.score}
                                                        <span className="text-gray-300 mx-1">
                                                            /
                                                        </span>
                                                        {result.total_questions}
                                                    </p>

                                                    <p className="text-xs font-semibold text-purple-600">
                                                        {Number(
                                                            result.percentage
                                                        ).toFixed(1)}
                                                        %
                                                    </p>

                                                </div>

                                            </div>

                                            {/* Completion */}

                                            <div className="ml-14 sm:ml-16 mt-2">

                                                <p className="text-[10px] text-gray-400">
                                                    Completed{" "}
                                                    {formatDate(
                                                        result.completed_at
                                                    )}
                                                </p>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    )}

                </div>

                {/* =================================================
                    NOTE
                ================================================= */}

                <div className="text-center mt-8">

                    <p className="text-xs sm:text-sm text-gray-400">
                        Keep studying the Word and growing in knowledge.
                    </p>

                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-300 mt-2">
                        Spirit Filled Ministries
                    </p>

                </div>

            </main>

        </section>
    );
}