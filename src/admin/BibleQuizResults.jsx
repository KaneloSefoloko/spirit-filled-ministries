import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BibleQuizResults() {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState("");

    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [attemptAnswers, setAttemptAnswers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    // =========================================================
    // LOAD QUIZZES
    // =========================================================

    useEffect(() => {
        async function loadQuizzes() {
            try {
                setLoading(true);
                setError("");

                const { data, error: quizError } = await supabase
                    .from("bible_quizzes")
                    .select("*")
                    .order("created_at", {
                        ascending: false,
                    });

                if (quizError) {
                    throw quizError;
                }

                const quizData = data || [];

                setQuizzes(quizData);

                if (quizData.length > 0) {
                    setSelectedQuizId(quizData[0].id);
                }
            } catch (err) {
                console.error(
                    "❌ Bible quiz results loading error:",
                    err
                );

                setError(
                    err?.message ||
                        "Unable to load Bible quiz results."
                );
            } finally {
                setLoading(false);
            }
        }

        loadQuizzes();
    }, []);

    // =========================================================
    // LOAD RESULTS
    // =========================================================

    useEffect(() => {
        if (!selectedQuizId) {
            setResults([]);
            return;
        }

        async function loadResults() {
            try {
                setLoading(true);
                setError("");
                setSelectedResult(null);
                setAttemptAnswers([]);

                const { data, error: resultsError } = await supabase
                    .from("bible_quiz_results")
                    .select(`
id,
    quiz_id,
    user_id,
    score,
    total_questions,
    percentage,
    completed_at,
    first_name,
    surname,
    email,
    is_visitor,
    branch_id,
    branches (
        id,
        name
    )
        `)
                    .eq("quiz_id", selectedQuizId)
                    .order("completed_at", {
                        ascending: false,
                    });

                if (resultsError) {
                    throw resultsError;
                }

                setResults(data || []);
            } catch (err) {
                console.error(
                    "❌ Bible quiz participant results error:",
                    err
                );

                setError(
                    err?.message ||
                        "Unable to load participant results."
                );
            } finally {
                setLoading(false);
            }
        }

        loadResults();
    }, [selectedQuizId]);

    // =========================================================
    // LOAD RESULT DETAILS
    // =========================================================

    async function openResult(result) {
        try {
            setSelectedResult(result);
            setLoadingDetails(true);
            setError("");
            setAttemptAnswers([]);

            // -----------------------------------------------------
            // LOAD PARTICIPANT ANSWERS
            // -----------------------------------------------------

            const {
                data: attemptData,
                error: attemptError,
            } = await supabase
                .from("bible_quiz_attempt_answers")
                .select(`
id,
    result_id,
    question_id,
    selected_answer_id,
    is_correct,
    created_at
        `)
                .eq("result_id", result.id)
                .order("created_at", {
                    ascending: true,
                });

            if (attemptError) {
                throw attemptError;
            }

            const attempts = attemptData || [];

            if (attempts.length === 0) {
                setAttemptAnswers([]);
                return;
            }

            // -----------------------------------------------------
            // GET QUESTION IDS
            // -----------------------------------------------------

            const questionIds = [
                ...new Set(
                    attempts
                        .map((attempt) => attempt.question_id)
                        .filter(Boolean)
                ),
            ];

            // -----------------------------------------------------
            // LOAD QUESTIONS
            // -----------------------------------------------------

            const {
                data: questionData,
                error: questionError,
            } = await supabase
                .from("bible_quiz_questions")
                .select(`
id,
    question,
    explanation,
    order_number,
    bible_reference,
    difficulty,
    points
        `)
                .in("id", questionIds);

            if (questionError) {
                throw questionError;
            }

            // -----------------------------------------------------
            // LOAD ALL ANSWERS FOR THESE QUESTIONS
            //
            // This is important because the admin needs to see
            // the actual correct answer, not just the participant's
            // selected answer.
            // -----------------------------------------------------

            const {
                data: answerData,
                error: answerError,
            } = await supabase
                .from("bible_quiz_answers")
                .select(`
id,
    question_id,
    answer,
    option_letter,
    is_correct
        `)
                .in("question_id", questionIds)
                .order("display_order", {
                    ascending: true,
                });

            if (answerError) {
                throw answerError;
            }

            // -----------------------------------------------------
            // CREATE LOOKUP MAPS
            // -----------------------------------------------------

            const questionsById = new Map(
                (questionData || []).map((question) => [
                    question.id,
                    question,
                ])
            );

            const answersById = new Map(
                (answerData || []).map((answer) => [
                    answer.id,
                    answer,
                ])
            );

            const answersByQuestionId = new Map();

            (answerData || []).forEach((answer) => {
                if (!answersByQuestionId.has(answer.question_id)) {
                    answersByQuestionId.set(answer.question_id, []);
                }

                answersByQuestionId
                    .get(answer.question_id)
                    .push(answer);
            });

            // -----------------------------------------------------
            // FORMAT DETAILS
            // -----------------------------------------------------

            const formattedAnswers = attempts
                .map((attempt) => {
                    const question =
                        questionsById.get(attempt.question_id) || null;

                    const selectedAnswer =
                        attempt.selected_answer_id
                            ? answersById.get(
                                  attempt.selected_answer_id
                              ) || null
                            : null;

                    const questionAnswers =
                        answersByQuestionId.get(
                            attempt.question_id
                        ) || [];

                    const correctAnswer =
                        questionAnswers.find(
                            (answer) => answer.is_correct
                        ) || null;

                    return {
                        ...attempt,
                        question,
                        selectedAnswer,
                        correctAnswer,
                    };
                })
                .sort(
                    (a, b) =>
                        (a.question?.order_number ?? 0) -
                        (b.question?.order_number ?? 0)
                );

            setAttemptAnswers(formattedAnswers);
        } catch (err) {
            console.error(
                "❌ Bible quiz result details error:",
                err
            );

            setError(
                err?.message ||
                    "Unable to load this participant's answers."
            );
        } finally {
            setLoadingDetails(false);
        }
    }

    // =========================================================
    // CLOSE DETAILS
    // =========================================================

    function closeDetails() {
        setSelectedResult(null);
        setAttemptAnswers([]);
    }

    // =========================================================
    // SELECTED QUIZ
    // =========================================================

    const selectedQuiz = useMemo(
        () =>
            quizzes.find(
                (quiz) => quiz.id === selectedQuizId
            ),
        [quizzes, selectedQuizId]
    );

    // =========================================================
    // FILTER RESULTS
    // =========================================================

    const filteredResults = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) {
            return results;
        }

        return results.filter((result) => {
            const fullName =
                `${result.first_name || ""} ${
    result.surname || ""
}`.toLowerCase();

            const email =
                result.email?.toLowerCase() || "";

            const branch =
                result.branches?.name?.toLowerCase() || "";

            return (
                fullName.includes(search) ||
                email.includes(search) ||
                branch.includes(search)
            );
        });
    }, [results, searchTerm]);

    // =========================================================
    // DATE FORMAT
    // =========================================================

    function formatDate(date) {
        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleString("en-ZA", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    // =========================================================
    // LOADING
    // =========================================================

    if (loading && quizzes.length === 0) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-950">
                        Bible Quiz Results
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View member quiz results.
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <div className="w-8 h-8 mx-auto rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin" />

                    <p className="mt-4 text-sm text-gray-500">
                        Loading quiz results...
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error && quizzes.length === 0) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-950">
                        Bible Quiz Results
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View member quiz results.
                    </p>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    // =========================================================
    // MAIN
    // =========================================================

    return (
        <div className="space-y-8">
            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] font-semibold text-purple-600 mb-2">
                        Bible Quiz
                    </p>

                    <h1 className="text-3xl font-bold text-gray-950">
                        Quiz Results
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View and review participant submissions.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-3 rounded-xl bg-purple-50 border border-purple-100">
                        <span className="text-xs text-purple-600 font-semibold">
                            Submissions
                        </span>

                        <p className="text-xl font-bold text-purple-950">
                            {results.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* =====================================================
                CONTROLS
            ====================================================== */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">
                            Select Quiz
                        </label>

                        <select
                            value={selectedQuizId}
                            onChange={(e) =>
                                setSelectedQuizId(e.target.value)
                            }
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {quizzes.map((quiz) => (
                                <option
                                    key={quiz.id}
                                    value={quiz.id}
                                >
                                    {quiz.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">
                            Search Participants
                        </label>

                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            placeholder="Name, email or branch..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* =====================================================
                QUIZ INFO
            ====================================================== */}

            {selectedQuiz && (
                <div className="bg-gradient-to-r from-indigo-950 via-purple-800 to-violet-900 rounded-2xl text-white p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-purple-200 font-semibold">
                        Selected Quiz
                    </p>

                    <h2 className="text-2xl font-bold mt-2">
                        {selectedQuiz.title}
                    </h2>

                    {selectedQuiz.description && (
                        <p className="text-sm text-white/70 mt-2 max-w-2xl">
                            {selectedQuiz.description}
                        </p>
                    )}
                </div>
            )}

            {/* =====================================================
                ERROR
            ====================================================== */}

            {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* =====================================================
                RESULTS TABLE
            ====================================================== */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center">
                        <div className="w-8 h-8 mx-auto rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin" />

                        <p className="mt-4 text-sm text-gray-500">
                            Loading results...
                        </p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-xl">
                            📖
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-gray-900">
                            No Results Found
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                            No participants have submitted this quiz yet.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* =================================================
                            DESKTOP TABLE
                        ================================================== */}

                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.15em] text-gray-400 font-semibold">
                                            Participant
                                        </th>

                                        <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.15em] text-gray-400 font-semibold">
                                            Branch
                                        </th>

                                        <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.15em] text-gray-400 font-semibold">
                                            Score
                                        </th>

                                        <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.15em] text-gray-400 font-semibold">
                                            Percentage
                                        </th>

                                        <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.15em] text-gray-400 font-semibold">
                                            Completed
                                        </th>

                                        <th className="px-6 py-4" />
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {filteredResults.map((result) => (
                                        <tr
                                            key={result.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-5">
                                                <p className="font-semibold text-gray-900">
                                                    {result.first_name || "Unknown"}{" "}
                                                    {result.surname || ""}
                                                </p>

                                                <p className="text-xs text-gray-400 mt-1">
                                                    {result.email ||
                                                        "No email"}
                                                </p>
                                            </td>

                                            <td className="px-6 py-5">
                                                {result.is_visitor ? (
                                                    <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                                                        Visitor
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-700">
                                                        {result.branches?.name ||
                                                            "Unknown"}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="font-bold text-gray-900">
                                                    {result.score ?? 0}
                                                </span>

                                                <span className="text-gray-400">
                                                    {" "}
                                                    /{" "}
                                                    {
                                                        result.total_questions
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
    Number(
        result.percentage
    ) >= 80
        ? "bg-emerald-50 text-emerald-700"
        : Number(
            result.percentage
        ) >= 50
            ? "bg-amber-50 text-amber-700"
            : "bg-red-50 text-red-600"
}`}
                                                >
                                                    {Math.round(
                                                        Number(
                                                            result.percentage || 0
                                                        )
                                                    )}
                                                    %
                                                </span>
                                            </td>

                                            <td className="px-6 py-5 text-sm text-gray-500">
                                                {formatDate(
                                                    result.completed_at
                                                )}
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openResult(result)
                                                    }
                                                    className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition-colors"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* =================================================
                            MOBILE CARDS
                        ================================================== */}

                        <div className="md:hidden divide-y divide-gray-100">
                            {filteredResults.map((result) => (
                                <button
                                    key={result.id}
                                    type="button"
                                    onClick={() =>
                                        openResult(result)
                                    }
                                    className="w-full text-left p-5 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {result.first_name || "Unknown"}{" "}
                                                {result.surname || ""}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-1 break-all">
                                                {result.email ||
                                                    "No email"}
                                            </p>
                                        </div>

                                        <span className="shrink-0 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
                                            {Math.round(
                                                Number(
                                                    result.percentage || 0
                                                )
                                            )}
                                            %
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 text-xs">
                                        <span className="text-gray-500">
                                            {result.is_visitor
                                                ? "Visitor"
                                                : result.branches?.name ||
                                                  "Unknown branch"}
                                        </span>

                                        <span className="font-semibold text-gray-800">
                                            {result.score ?? 0} /{" "}
                                            {result.total_questions}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* =====================================================
                RESULT DETAILS MODAL
            ====================================================== */}

            {selectedResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}

                    <div
                        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
                        onClick={closeDetails}
                    />

                    {/* Modal */}

                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-3xl shadow-2xl">
                        {/* =================================================
                            MODAL HEADER
                        ================================================== */}

                        <div className="relative bg-gradient-to-br from-indigo-950 via-purple-800 to-violet-900 text-white p-6 sm:p-8">
                            <button
                                type="button"
                                onClick={closeDetails}
                                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg"
                                aria-label="Close"
                            >
                                ×
                            </button>

                            <p className="text-xs uppercase tracking-[0.2em] text-purple-200 font-semibold">
                                Participant Result
                            </p>

                            <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                                {selectedResult.first_name ||
                                    "Unknown"}{" "}
                                {selectedResult.surname || ""}
                            </h2>

                            <p className="text-sm text-white/60 mt-1">
                                {selectedResult.email ||
                                    "No email provided"}
                            </p>

                            <div className="flex flex-wrap gap-3 mt-6">
                                {/* Score */}

                                <div className="px-4 py-3 rounded-xl bg-white/10 border border-white/10">
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/50">
                                        Score
                                    </p>

                                    <p className="text-lg font-bold mt-1">
                                        {selectedResult.score ?? 0} /{" "}
                                        {
                                            selectedResult.total_questions
                                        }
                                    </p>
                                </div>

                                {/* Percentage */}

                                <div className="px-4 py-3 rounded-xl bg-white/10 border border-white/10">
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/50">
                                        Percentage
                                    </p>

                                    <p className="text-lg font-bold mt-1">
                                        {Math.round(
                                            Number(
                                                selectedResult.percentage ||
                                                    0
                                            )
                                        )}
                                        %
                                    </p>
                                </div>

                                {/* Branch */}

                                <div className="px-4 py-3 rounded-xl bg-white/10 border border-white/10">
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/50">
                                        Branch
                                    </p>

                                    <p className="text-sm font-semibold mt-1">
                                        {selectedResult.is_visitor
                                            ? "Visitor"
                                            : selectedResult.branches
                                                  ?.name ||
                                              "Unknown"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            MODAL BODY
                        ================================================== */}

                        <div className="overflow-y-auto max-h-[55vh] p-5 sm:p-8">
                            {loadingDetails ? (
                                <div className="py-12 text-center">
                                    <div className="w-8 h-8 mx-auto rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin" />

                                    <p className="mt-4 text-sm text-gray-500">
                                        Loading answers...
                                    </p>
                                </div>
                            ) : attemptAnswers.length === 0 ? (
                                <div className="py-12 text-center text-sm text-gray-500">
                                    No answer details were found.
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {attemptAnswers.map(
                                        (attempt, index) => {
                                            const question =
                                                attempt.question;

                                            const selectedAnswer =
                                                attempt.selectedAnswer;

                                            const correctAnswer =
                                                attempt.correctAnswer;

                                            return (
                                                <div
                                                    key={attempt.id}
                                                    className={`rounded-2xl border p-5 ${
    attempt.is_correct
        ? "border-emerald-100 bg-emerald-50/50"
        : "border-red-100 bg-red-50/50"
}`}
                                                >
                                                    {/* Question heading */}

                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <p className="text-xs uppercase tracking-[0.15em] font-semibold text-gray-400">
                                                                Question{" "}
                                                                {index + 1}
                                                            </p>

                                                            <h3 className="font-semibold text-gray-900 mt-2 leading-relaxed">
                                                                {question?.question ||
                                                                    "Question unavailable"}
                                                            </h3>
                                                        </div>

                                                        <span
                                                            className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
    attempt.is_correct
        ? "bg-emerald-100 text-emerald-700"
        : "bg-red-100 text-red-700"
}`}
                                                        >
                                                            {attempt.is_correct
                                                                ? "Correct"
                                                                : "Incorrect"}
                                                        </span>
                                                    </div>

                                                    {/* Selected answer */}

                                                    <div className="mt-5">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                                                            Selected Answer
                                                        </p>

                                                        {selectedAnswer ? (
                                                            <div
                                                                className={`mt-2 flex items-start gap-3 rounded-xl border p-3 ${
    attempt.is_correct
        ? "bg-white border-emerald-100"
        : "bg-white border-red-100"
}`}
                                                            >
                                                                <span className="w-8 h-8 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold">
                                                                    {
                                                                        selectedAnswer.option_letter
                                                                    }
                                                                </span>

                                                                <span className="text-sm text-gray-700 pt-1">
                                                                    {
                                                                        selectedAnswer.answer
                                                                    }
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700">
                                                                No answer selected.
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Correct answer */}

                                                    {!attempt.is_correct && (
                                                        <div className="mt-4">
                                                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                                                                Correct Answer
                                                            </p>

                                                            {correctAnswer ? (
                                                                <div className="mt-2 flex items-start gap-3 bg-white rounded-xl border border-emerald-100 p-3">
                                                                    <span className="w-8 h-8 shrink-0 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                                                                        {
                                                                            correctAnswer.option_letter
                                                                        }
                                                                    </span>

                                                                    <span className="text-sm text-gray-700 pt-1">
                                                                        {
                                                                            correctAnswer.answer
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="mt-2 rounded-xl border border-gray-100 bg-white p-3 text-sm text-gray-500">
                                                                    Correct answer could not be found.
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Explanation */}

                                                    {question?.explanation && (
                                                        <div className="mt-4 rounded-xl bg-white/70 border border-gray-100 p-4">
                                                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                                                                Explanation
                                                            </p>

                                                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                                                {
                                                                    question.explanation
                                                                }
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Metadata */}

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
                                                        {question?.bible_reference && (
                                                            <p className="text-xs text-gray-400">
                                                                📖{" "}
                                                                {
                                                                    question.bible_reference
                                                                }
                                                            </p>
                                                        )}

                                                        {question?.difficulty && (
                                                            <p className="text-xs text-gray-400">
                                                                Difficulty:{" "}
                                                                {
                                                                    question.difficulty
                                                                }
                                                            </p>
                                                        )}

                                                        {question?.points != null && (
                                                            <p className="text-xs text-gray-400">
                                                                Points:{" "}
                                                                {
                                                                    question.points
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </div>

                        {/* =================================================
                            MODAL FOOTER
                        ================================================== */}

                        <div className="border-t border-gray-100 bg-gray-50 px-5 sm:px-8 py-4 flex justify-end">
                            <button
                                type="button"
                                onClick={closeDetails}
                                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}