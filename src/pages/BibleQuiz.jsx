import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { BookOpen} from "lucide-react";

export default function BibleQuiz() {
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [branches, setBranches] = useState([]);

    const [firstName, setFirstName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [branchId, setBranchId] = useState("");
    const [isVisitor, setIsVisitor] = useState(false);

    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);

    const [loading, setLoading] = useState(true);
    const [checkingParticipant, setCheckingParticipant] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);

    // =========================================================
    // LOAD ACTIVE QUIZ
    // =========================================================

    useEffect(() => {
        async function loadQuiz() {
            try {
                setLoading(true);
                setError("");

                // -------------------------------------------------
                // ACTIVE QUIZ
                // -------------------------------------------------
                const today = new Date().toISOString().split("T")[0];

                const {
                    data: quizData,
                    error: quizError,
                } = await supabase
                    .from("bible_quizzes")
                    .select("*")
                    .eq("is_active", true)
                    .lte("start_date", today)
                    .gte("end_date", today)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (quizError) {
                    throw quizError;
                }

                if (!quizData) {
                    setQuiz(null);
                    setQuestions([]);
                    return;
                }

                setQuiz(quizData);

                // -------------------------------------------------
                // BRANCHES
                // -------------------------------------------------

                const {
                    data: branchData,
                    error: branchError,
                } = await supabase
                    .from("branches")
                    .select("id, name")
                    .order("name", { ascending: true });

                if (branchError) {
                    throw branchError;
                }

                setBranches(branchData || []);

                // -------------------------------------------------
                // QUESTIONS + PUBLIC ANSWERS
                //
                // IMPORTANT:
                // is_correct is intentionally NOT selected.
                // Correct answers must never be exposed to the
                // public browser.
                // -------------------------------------------------

                const {
                    data: questionData,
                    error: questionError,
                } = await supabase
                    .from("bible_quiz_questions")
                    .select(`
id,
    quiz_id,
    question,
    explanation,
    order_number,
    bible_reference,
    difficulty,
    points,
    image_url,
    bible_quiz_answers (
        id,
        answer,
        option_letter,
        display_order
    )
        `)
                    .eq("quiz_id", quizData.id)
                    .order("order_number", {
                        ascending: true,
                        nullsFirst: false,
                    });

                if (questionError) {
                    throw questionError;
                }

                const formattedQuestions = (questionData || []).map(
                    (question) => ({
                        ...question,
                        bible_quiz_answers: [
                            ...(question.bible_quiz_answers || []),
                        ].sort(
                            (a, b) =>
                                (a.display_order ?? 0) -
                                (b.display_order ?? 0)
                        ),
                    })
                );

                setQuestions(formattedQuestions);
            } catch (err) {
                console.error("❌ Bible quiz loading error:", err);

                setError(
                    err?.message || "Unable to load the Bible quiz."
                );
            } finally {
                setLoading(false);
            }
        }

        loadQuiz();
    }, []);

    // =========================================================
    // NORMALIZE EMAIL
    // =========================================================

    function getNormalizedEmail() {
        return email.trim().toLowerCase();
    }

    // =========================================================
    // SELECT ANSWER
    // =========================================================

    function selectAnswer(questionId, answerId) {
        if (submitting) {
            return;
        }

        setSelectedAnswers((previous) => ({
            ...previous,
            [questionId]: answerId,
        }));
    }

    // =========================================================
    // NAVIGATION
    // =========================================================

    function goToNextQuestion() {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((previous) => previous + 1);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }

    function goToPreviousQuestion() {
        if (currentQuestion > 0) {
            setCurrentQuestion((previous) => previous - 1);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }

    // =========================================================
    // CHECK IF PARTICIPANT ALREADY SUBMITTED
    // =========================================================

    async function checkExistingSubmission() {
        const normalizedEmail = getNormalizedEmail();

        const {
            data: existingResult,
            error: existingError,
        } = await supabase
            .from("bible_quiz_results")
            .select("id")
            .eq("quiz_id", quiz.id)
            .eq("email", normalizedEmail)
            .limit(1)
            .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        return existingResult;
    }

    // =========================================================
    // START QUIZ
    // =========================================================

    async function startQuiz(e) {
        e.preventDefault();

        if (checkingParticipant || quizStarted) {
            return;
        }

        if (!firstName.trim()) {
            alert("Please enter your name.");
            return;
        }

        if (!surname.trim()) {
            alert("Please enter your surname.");
            return;
        }

        if (!email.trim()) {
            alert("Please enter your email address.");
            return;
        }

        if (!isVisitor && !branchId) {
            alert("Please select your branch or choose Visitor.");
            return;
        }

        try {
            setCheckingParticipant(true);
            setError("");
            setAlreadySubmitted(false);

            const existingResult = await checkExistingSubmission();

            if (existingResult) {
                setAlreadySubmitted(true);
                return;
            }

            setQuizStarted(true);
            setCurrentQuestion(0);
            setSelectedAnswers({});

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (err) {
            console.error("❌ Duplicate quiz check error:", err);

            setError(
                err?.message || "Unable to verify your quiz status."
            );
        } finally {
            setCheckingParticipant(false);
        }
    }

    // =========================================================
    // SUBMIT QUIZ
    //
    // Scoring is performed by the Supabase RPC.
    // The browser never receives is_correct.
    // =========================================================

    async function submitQuiz() {
        if (loading || submitting || !quiz) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            // -------------------------------------------------
            // MAKE SURE ALL QUESTIONS ARE ANSWERED
            // -------------------------------------------------

            const unansweredQuestions = questions.filter(
                (quizQuestion) => !selectedAnswers[quizQuestion.id]
            );

            if (unansweredQuestions.length > 0) {
                alert(
                    `Please answer all questions before submitting.\n\n` +
                        `${unansweredQuestions.length} question${
                        unansweredQuestions.length === 1 ? "" : "s"
                    } remaining.`
                );

                return;
            }

            // -------------------------------------------------
            // NORMALIZE EMAIL
            // -------------------------------------------------

            const normalizedEmail = getNormalizedEmail();

            // -------------------------------------------------
            // FINAL CLIENT-SIDE DUPLICATE CHECK
            //
            // The database constraint/RPC remains the real
            // protection against race conditions.
            // -------------------------------------------------

            const existingResult = await checkExistingSubmission();

            if (existingResult) {
                setAlreadySubmitted(true);
                setShowSubmitConfirmation(false);
                return;
            }

            // -------------------------------------------------
            // PREPARE ANSWERS
            //
            // Only IDs are sent. Correctness is determined
            // securely inside Supabase.
            // -------------------------------------------------

            const answers = questions.map((quizQuestion) => ({
                question_id: quizQuestion.id,
                selected_answer_id:
                    selectedAnswers[quizQuestion.id],
            }));

            // -------------------------------------------------
            // SECURE SUBMISSION RPC
            // -------------------------------------------------

            const {
                data,
                error: rpcError,
            } = await supabase.rpc("submit_bible_quiz", {
                p_quiz_id: quiz.id,
                p_first_name: firstName.trim(),
                p_surname: surname.trim(),
                p_email: normalizedEmail,
                p_branch_id: isVisitor ? null : branchId,
                p_is_visitor: isVisitor,
                p_answers: answers,
            });

            if (rpcError) {
                // PostgreSQL unique violation
                if (rpcError.code === "23505") {
                    setAlreadySubmitted(true);
                    setShowSubmitConfirmation(false);
                    return;
                }

                throw rpcError;
            }

            if (!data) {
                throw new Error(
                    "The quiz was submitted, but no result was returned."
                );
            }

            console.log("QUIZ RESULT SAVED:", data);

            // -------------------------------------------------
            // SHOW RESULTS
            // -------------------------------------------------

            setShowSubmitConfirmation(false);

            setQuizResult({
                resultId: data.result_id,
                score: Number(data.score) || 0,
                totalPoints: Number(data.total_points) || 0,
                totalQuestions:
                    Number(data.total_questions) || questions.length,
                percentage: Number(data.percentage) || 0,
                correctAnswers: Number(data.correct_answers) || 0,
                incorrectAnswers: Number(data.incorrect_answers) || 0,
            });
        } catch (err) {
            console.error("❌ Quiz submission error:", err);

            alert(
                `Unable to submit quiz:\n\n${
    err?.message || "Unknown error"
}`
            );
        } finally {
            setSubmitting(false);
        }
    }

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f7f9] flex items-center justify-center px-5">
                <div className="text-center">
                    <div className="relative w-14 h-14 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-purple-100" />

                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" />
                    </div>

                    <p className="text-sm font-medium text-gray-500">
                        Preparing your Bible quiz...
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <div className="min-h-screen bg-[#f7f7f9] flex items-center justify-center px-5">
                <div className="w-full max-w-md bg-white rounded-[28px] shadow-xl border border-gray-100 p-8 sm:p-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center text-2xl">
                        !
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Unable to Load Quiz
                    </h1>

                    <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // NO ACTIVE QUIZ
    // =========================================================

    if (!quiz || questions.length === 0) {
        return (
            <div className="min-h-screen bg-[#f7f7f9] flex items-center justify-center px-5">
                <div className="w-full max-w-lg bg-white rounded-[30px] shadow-xl border border-gray-100 p-8 sm:p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-7 rounded-[24px] bg-purple-50 flex items-center justify-center text-3xl">
                        <BookOpen className="w-10 h-10 mb-5 text-white"/>
                    </div>

                    <p className="text-xs uppercase tracking-[0.3em] font-semibold text-purple-600 mb-4">
                        Bible Quiz
                    </p>

                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                        No Quiz Available
                    </h1>

                    <p className="text-gray-500 leading-relaxed">
                        There is currently no active Bible quiz. Please
                        check back when the next quiz is available.
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // RESULTS SCREEN
    // =========================================================

    if (quizResult) {
        const percentage = quizResult.percentage;
        const correctAnswers = quizResult.correctAnswers;
        const incorrectAnswers = quizResult.incorrectAnswers;

        return (
            <div className="min-h-screen bg-[#f7f7f9] text-gray-900">
                <header className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-800 to-violet-900 text-white">
                    <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-fuchsia-400/20 blur-3xl" />

                    <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-indigo-400/20 blur-3xl" />

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />

                    <div className="relative max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-sm">✦</span>
                            </div>

                            <p className="text-[10px] sm:text-xs uppercase tracking-[0.32em] text-white/75 font-medium">
                                Spirit Filled Ministries
                            </p>
                        </div>

                        <p className="text-xs uppercase tracking-[0.3em] text-purple-200 font-semibold mb-4">
                            Quiz Complete
                        </p>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                            Well done, {firstName}.
                        </h1>

                        <p className="mt-5 text-sm sm:text-base md:text-lg text-white/70 leading-relaxed max-w-2xl">
                            You have completed this week's Bible quiz.
                            Your result has been recorded successfully.
                        </p>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
                    <div className="bg-white rounded-[30px] border border-gray-100 shadow-[0_15px_50px_rgba(15,23,42,0.07)] overflow-hidden">
                        <div className="p-7 sm:p-10 lg:p-12">
                            <div className="text-center">
                                <p className="text-xs uppercase tracking-[0.28em] font-semibold text-purple-600 mb-3">
                                    Your Result
                                </p>

                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
                                    {quiz.title}
                                </h2>
                            </div>

                            <div className="flex justify-center mt-10">
                                <div className="relative w-44 h-44 sm:w-52 sm:h-52">
                                    <div
                                        className="absolute inset-0 rounded-full"
                                        style={{
                                            background: `conic-gradient(#7c3aed ${percentage}%, #ede9fe ${percentage}% 100%)`,
                                        }}
                                    />

                                    <div className="absolute inset-[10px] rounded-full bg-white flex flex-col items-center justify-center">
                                        <span className="text-4xl sm:text-5xl font-bold text-gray-950">
                                            {Math.round(percentage)}%
                                        </span>

                                        <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold mt-1">
                                            Score
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-8">
                                <p className="text-3xl sm:text-4xl font-bold text-gray-950">
                                    {quizResult.score}

                                    <span className="text-gray-300 mx-2">
                                        /
                                    </span>

                                    {quizResult.totalPoints}
                                </p>

                                <p className="text-sm text-gray-500 mt-2">
                                    Points earned
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-10 max-w-xl mx-auto">
                                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 text-center">
                                    <p className="text-2xl sm:text-3xl font-bold text-emerald-700">
                                        {correctAnswers}
                                    </p>

                                    <p className="text-xs uppercase tracking-[0.18em] font-semibold text-emerald-600 mt-1">
                                        Correct
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-red-50 border border-red-100 p-5 text-center">
                                    <p className="text-2xl sm:text-3xl font-bold text-red-600">
                                        {incorrectAnswers}
                                    </p>

                                    <p className="text-xs uppercase tracking-[0.18em] font-semibold text-red-500 mt-1">
                                        Incorrect
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 bg-gray-50/70 px-6 sm:px-10 py-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-center sm:text-left">
                                    <p className="text-sm font-semibold text-gray-800">
                                        Thank you for participating.
                                    </p>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Keep studying the Word and growing
                                        in knowledge.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            window.location.href =
                                                "/bible-quiz/leaderboard";
                                        }}
                                        className="
                                            inline-flex items-center justify-center gap-2
                                            px-6 py-3.5 rounded-xl
                                            bg-purple-600 text-white text-sm font-semibold
                                            shadow-lg shadow-purple-600/20
                                            hover:bg-purple-700 transition-all
                                        "
                                    >
                                        View Leaderboard
                                        <span>→</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            window.location.href = "/";
                                        }}
                                        className="
                                            inline-flex items-center justify-center gap-2
                                            px-6 py-3.5 rounded-xl
                                            border border-gray-200 bg-white
                                            text-gray-700 text-sm font-semibold
                                            hover:bg-gray-50 transition-all
                                        "
                                    >
                                        Return Home
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-xs sm:text-sm text-gray-400">
                            "Study to show thyself approved unto God."
                        </p>

                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-300 mt-2">
                            2 Timothy 2:15
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    // =========================================================
    // ALREADY SUBMITTED
    // =========================================================

    if (alreadySubmitted) {
        return (
            <div className="min-h-screen bg-[#f7f7f9] text-gray-900 flex items-center justify-center px-5">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-[30px] border border-gray-100 shadow-[0_15px_50px_rgba(15,23,42,0.07)] overflow-hidden">
                        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-800 to-violet-900 text-white px-7 sm:px-10 py-12 sm:py-14 text-center">
                            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-fuchsia-400/20 blur-3xl" />

                            <div className="absolute -bottom-28 -left-24 w-64 h-64 rounded-full bg-indigo-400/20 blur-3xl" />

                            <div className="relative">
                                <div className="w-20 h-20 mx-auto rounded-[24px] bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm text-3xl mb-6">
                                    ✓
                                </div>

                                <p className="text-xs uppercase tracking-[0.3em] text-purple-200 font-semibold mb-3">
                                    Quiz Already Completed
                                </p>

                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                    You're all done.
                                </h1>
                            </div>
                        </div>

                        <div className="p-7 sm:p-10 text-center">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-950 mb-3">
                                You have already submitted this quiz.
                            </h2>

                            <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                                Our records show that{" "}
                                <span className="font-semibold text-gray-800">
                                    {firstName.trim()} {surname.trim()}
                                </span>{" "}
                                has already completed{" "}
                                <span className="font-semibold text-gray-800">
                                    {quiz.title}
                                </span>
                                .
                            </p>

                            <div className="mt-7 rounded-2xl bg-purple-50 border border-purple-100 px-5 py-4">
                                <p className="text-sm font-medium text-purple-900">
                                    Each participant may submit this quiz
                                    only once.
                                </p>
                            </div>

                            <p className="mt-6 text-xs text-gray-400">
                                Thank you for participating and studying
                                the Word.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    window.location.href =
                                        "/bible-quiz/leaderboard";
                                }}
                                className="
                                    mt-7 w-full inline-flex items-center justify-center gap-2
                                    px-6 py-3.5 rounded-xl
                                    bg-purple-600 text-white text-sm font-semibold
                                    hover:bg-purple-700 transition-all
                                "
                            >
                                View Leaderboard
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // PARTICIPANT FORM
    // =========================================================

    if (!quizStarted) {
        return (
            <div className="min-h-screen bg-[#f7f7f9] text-gray-900">
                <header className="relative overflow-hidden bg-[#0b0b12] text-white">
                    <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl" />

                    <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%)]" />

                    <div className="relative max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-12 sm:py-16">
                        <div className="flex items-center gap-3 mb-7">
                            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                                <span className="text-sm">✦</span>
                            </div>

                            <p className="text-[10px] sm:text-xs uppercase tracking-[0.32em] text-white/60 font-medium">
                                Spirit Filled Ministries
                            </p>
                        </div>

                        <p className="text-xs uppercase tracking-[0.3em] text-purple-300 font-semibold mb-4">
                            Weekly Bible Quiz
                        </p>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                            {quiz.title}
                        </h1>

                        {quiz.description && (
                            <p className="mt-5 text-sm sm:text-base md:text-lg text-white/60 leading-relaxed max-w-2xl">
                                {quiz.description}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-3 mt-7">
                            <div className="px-4 py-2.5 rounded-full bg-white/10 border border-white/10 text-xs sm:text-sm text-white/75">
                                {questions.length}{" "}
                                {questions.length === 1
                                    ? "Question"
                                    : "Questions"}
                            </div>

                            <div className="px-4 py-2.5 rounded-full bg-white/10 border border-white/10 text-xs sm:text-sm text-white/75">
                                Multiple Choice
                            </div>

                            <div className="px-4 py-2.5 rounded-full bg-white/10 border border-white/10 text-xs sm:text-sm text-white/75">
                                One Submission
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-2xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
                    <div className="bg-white rounded-[30px] shadow-[0_15px_50px_rgba(15,23,42,0.07)] border border-gray-100 p-6 sm:p-10">
                        <div className="mb-8">
                            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-purple-600 mb-3">
                                Before You Begin
                            </p>

                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
                                Tell us about yourself
                            </h2>

                            <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
                                Please enter your details before starting
                                this week's Bible quiz. You will have one
                                opportunity to submit your answers.
                            </p>

                            <div className="mt-5 rounded-2xl bg-purple-50 border border-purple-100 p-4 sm:p-5">
                                <p className="text-sm font-semibold text-purple-900">
                                    How your details are used
                                </p>

                                <p className="mt-1.5 text-xs sm:text-sm text-purple-700/80 leading-relaxed">
                                    Your details are used to identify your
                                    quiz submission and display your name
                                    on the public leaderboard.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={startQuiz}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-800">
                                    Name *
                                </label>

                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    placeholder="Enter your name"
                                    autoComplete="given-name"
                                    maxLength={100}
                                    className="w-full border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-800">
                                    Surname *
                                </label>

                                <input
                                    type="text"
                                    value={surname}
                                    onChange={(e) =>
                                        setSurname(e.target.value)
                                    }
                                    placeholder="Enter your surname"
                                    autoComplete="family-name"
                                    maxLength={100}
                                    className="w-full border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-800">
                                    Email Address *
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="Enter your email address"
                                    autoComplete="email"
                                    maxLength={254}
                                    className="w-full border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-800">
                                    Which branch do you belong to? *
                                </label>

                                <select
                                    value={isVisitor ? "" : branchId}
                                    disabled={isVisitor}
                                    onChange={(e) =>
                                        setBranchId(e.target.value)
                                    }
                                    className="w-full border border-gray-200 rounded-2xl p-4 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <option value="">
                                        Select your branch
                                    </option>

                                    {branches.map((branch) => (
                                        <option
                                            key={branch.id}
                                            value={branch.id}
                                        >
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isVisitor}
                                    onChange={(e) => {
                                        const checked = e.target.checked;

                                        setIsVisitor(checked);

                                        if (checked) {
                                            setBranchId("");
                                        }
                                    }}
                                    className="mt-1 w-4 h-4 accent-purple-600"
                                />

                                <span>
                                    <span className="block text-sm font-semibold text-gray-800">
                                        I am a visitor
                                    </span>

                                    <span className="block text-sm text-gray-500 mt-1">
                                        I don't belong to a Spirit Filled
                                        Ministries branch.
                                    </span>
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={checkingParticipant}
                                className="
                                    w-full inline-flex items-center justify-center gap-3
                                    px-6 py-4 rounded-2xl
                                    bg-purple-600 text-white font-semibold
                                    shadow-lg shadow-purple-600/20
                                    hover:bg-purple-700 transition-all
                                    disabled:bg-purple-300
                                    disabled:cursor-not-allowed
                                "
                            >
                                {checkingParticipant ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        Start Quiz
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        );
    }

    // =========================================================
    // ACTIVE QUIZ
    // =========================================================

    const question = questions[currentQuestion];

    if (!question) {
        return null;
    }

    const selectedAnswer = selectedAnswers[question.id];

    const progress =
        ((currentQuestion + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-[#f7f7f9] text-gray-900">
            <header className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-800 to-violet-900 text-white">
                <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-fuchsia-400/20 blur-3xl" />

                <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />

                <div className="relative max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-12 sm:py-16">
                    <div className="flex items-center gap-3 mb-7">
                        <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-lg shadow-purple-950/20 backdrop-blur-sm">
                            <span className="text-sm text-white">✦</span>
                        </div>

                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.32em] text-white/75 font-medium">
                            Spirit Filled Ministries
                        </p>
                    </div>

                    <div className="max-w-3xl">
                        <p className="text-xs uppercase tracking-[0.3em] text-purple-200 font-semibold mb-4">
                            Weekly Bible Quiz
                        </p>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-white">
                            {quiz.title}
                        </h1>

                        {quiz.description && (
                            <p className="mt-5 text-sm sm:text-base md:text-lg text-white/70 leading-relaxed max-w-2xl">
                                {quiz.description}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-8">
                        <div className="px-4 py-2.5 rounded-full bg-white/10 border border-white/15 text-xs sm:text-sm text-white/80 backdrop-blur-sm">
                            {questions.length}{" "}
                            {questions.length === 1
                                ? "Question"
                                : "Questions"}
                        </div>

                        <div className="px-4 py-2.5 rounded-full bg-white/10 border border-white/15 text-xs sm:text-sm text-white/80 backdrop-blur-sm">
                            Test your Bible knowledge
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-end justify-between gap-4 mb-3">
                        <div>
                            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-purple-600 mb-1">
                                Your Progress
                            </p>

                            <p className="text-sm sm:text-base font-semibold text-gray-900">
                                Question {currentQuestion + 1}{" "}
                                <span className="font-normal text-gray-400">
                                    / {questions.length}
                                </span>
                            </p>
                        </div>

                        <span className="text-xs sm:text-sm font-semibold text-gray-500">
                            {Math.round(progress)}%
                        </span>
                    </div>

                    <div className="h-2.5 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-[26px] sm:rounded-[32px] border border-gray-100 shadow-[0_15px_50px_rgba(15,23,42,0.07)] overflow-hidden">
                    <div className="p-5 sm:p-8 md:p-10 lg:p-12">
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-6">
                            <span
                                className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold 
                                ${question.difficulty === "Hard" 
                                    ? "bg-red-50 text-red-600" 
                                    : question.difficulty === "Medium" 
                                        ? "bg-amber-50 text-amber-600" 
                                        : "bg-purple-50 text-purple-700"}
                                        `}
                            >
                                {question.difficulty}
                            </span>

                            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-600 text-[11px] sm:text-xs font-semibold">
                                {question.points}{" "}
                                {Number(question.points) === 1
                                    ? "point"
                                    : "points"}
                            </span>

                            {question.bible_reference && (
                                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-500 text-[11px] sm:text-xs font-medium">
                                    {question.bible_reference}
                                </span>
                            )}
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 mb-3">
                            Question {currentQuestion + 1}
                        </p>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.15] text-gray-950 max-w-3xl">
                            {question.question}
                        </h2>
                    </div>

                    {question.image_url && (
                        <div className="px-5 sm:px-8 md:px-10 lg:px-12 pb-2">
                            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-100">
                                <img
                                    src={question.image_url}
                                    alt=""
                                    className="w-full max-h-[420px] object-cover"
                                />
                            </div>
                        </div>
                    )}

                    <div className="px-5 sm:px-8 md:px-10 lg:px-12 py-7 sm:py-9">
                        <div className="mb-5">
                            <p className="text-xs uppercase tracking-[0.22em] font-semibold text-gray-400">
                                Choose your answer
                            </p>
                        </div>

                        <div className="grid gap-3 sm:gap-4">
                            {question.bible_quiz_answers.map((answer) => {
                                const isSelected =
                                    selectedAnswer === answer.id;

                                return (
                                    <button
                                        key={answer.id}
                                        type="button"
                                        onClick={() =>
                                            selectAnswer(
                                                question.id,
                                                answer.id
                                            )
                                        }
                                        className={`group relative w-full text-left rounded-2xl border-2 p-4 sm:p-5 
                                        transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/20
                                        ${isSelected 
                                            ? "border-purple-600 bg-purple-50 shadow-[0_8px_25px_rgba(124,58,237,0.12)]" 
                                            : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 hover:-translate-y-[1px]"
                                        }
                                        `}
                                    >
                                        <div className="flex items-center gap-3.5 sm:gap-4">
                                            <div
                                                className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl flex items-center justify-center 
                                                font-bold text-sm transition-all duration-200 
                                                ${isSelected 
                                                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20" 
                                                    : "bg-gray-100 text-gray-700 group-hover:bg-purple-100 group-hover:text-purple-700"
                                                }`}
                                            >
                                                {answer.option_letter}
                                            </div>

                                            <span
                                                className={`flex-1 text-sm sm:text-base leading-relaxed font-medium
                                                ${isSelected 
                                                    ? "text-purple-950" 
                                                    : "text-gray-800"
                                                }`}
                                            >
                                                {answer.answer}
                                            </span>

                                            <div
                                                className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center 
                                                transition-all ${isSelected 
                                                    ? "border-purple-600 bg-purple-600" 
                                                    : "border-gray-300"
                                                }`}
                                            >
                                                {isSelected && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 bg-gray-50/80 px-5 sm:px-8 md:px-10 lg:px-12 py-5 sm:py-6">
                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={goToPreviousQuestion}
                                disabled={
                                    currentQuestion === 0 || submitting
                                }
                                className="
                                    inline-flex items-center justify-center gap-2
                                    px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl
                                    border border-gray-200 bg-white
                                    text-sm font-semibold text-gray-700
                                    hover:bg-gray-100 transition-all
                                    disabled:opacity-30
                                    disabled:cursor-not-allowed
                                "
                            >
                                <span>←</span>

                                <span className="hidden sm:inline">
                                    Previous
                                </span>
                            </button>

                            <div className="text-xs font-medium text-gray-400 sm:hidden">
                                {currentQuestion + 1} / {questions.length}
                            </div>

                            {currentQuestion < questions.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={goToNextQuestion}
                                    disabled={
                                        !selectedAnswer || submitting
                                    }
                                    className="
                                        inline-flex items-center justify-center gap-2
                                        px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl
                                        bg-gray-950 text-white text-sm font-semibold
                                        shadow-lg shadow-gray-900/10
                                        hover:bg-purple-700 transition-all
                                        disabled:bg-gray-300
                                        disabled:shadow-none
                                        disabled:cursor-not-allowed
                                    "
                                >
                                    <span>Next</span>
                                    <span>→</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={
                                        !selectedAnswer || submitting
                                    }
                                    onClick={() =>
                                        setShowSubmitConfirmation(true)
                                    }
                                    className="
                                        inline-flex items-center justify-center gap-2
                                        px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl
                                        bg-emerald-600 text-white text-sm font-semibold
                                        shadow-lg shadow-emerald-600/10
                                        hover:bg-emerald-500 transition-all
                                        disabled:bg-gray-300
                                        disabled:shadow-none
                                        disabled:cursor-not-allowed
                                    "
                                >
                                    Submit Quiz
                                    <span>✓</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center mt-7 sm:mt-9">
                    <p className="text-xs sm:text-sm text-gray-400">
                        Take your time, read each question carefully, and
                        enjoy the Word.
                    </p>
                </div>
            </main>

            {/* =====================================================
                SUBMIT CONFIRMATION MODAL
            ===================================================== */}

            {showSubmitConfirmation && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-5"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="submit-quiz-title"
                >
                    <div
                        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
                        onClick={() => {
                            if (!submitting) {
                                setShowSubmitConfirmation(false);
                            }
                        }}
                    />

                    <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="p-7 sm:p-9">
                            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-6">
                                ✓
                            </div>

                            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-purple-600 mb-3">
                                Almost Done
                            </p>

                            <h2
                                id="submit-quiz-title"
                                className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950"
                            >
                                Submit your quiz?
                            </h2>

                            <p className="mt-4 text-sm sm:text-base text-gray-500 leading-relaxed">
                                You have answered all {questions.length}{" "}
                                questions. Once submitted, your answers
                                cannot be changed.
                            </p>

                            <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-100 p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-gray-500">
                                        Participant
                                    </span>

                                    <span className="text-sm font-semibold text-gray-900 text-right">
                                        {firstName.trim()}{" "}
                                        {surname.trim()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-7">
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() =>
                                        setShowSubmitConfirmation(false)
                                    }
                                    className="
                                        flex-1 px-5 py-3.5 rounded-xl
                                        border border-gray-200 bg-white
                                        text-sm font-semibold text-gray-700
                                        hover:bg-gray-50 transition-all
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                    "
                                >
                                    Go Back
                                </button>

                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={submitQuiz}
                                    className="
                                        flex-1 inline-flex items-center justify-center gap-2
                                        px-5 py-3.5 rounded-xl
                                        bg-emerald-600 text-white text-sm font-semibold
                                        shadow-lg shadow-emerald-600/10
                                        hover:bg-emerald-500 transition-all
                                        disabled:bg-gray-300
                                        disabled:shadow-none
                                        disabled:cursor-not-allowed
                                    "
                                >
                                    {submitting ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Quiz
                                            <span>✓</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}