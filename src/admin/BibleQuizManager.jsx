import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import QuizForm from "./QuizForm";
import QuizCard from "./QuizCard";
import BibleQuestionManager from "./BibleQuestionManager";

export default function BibleQuizManager() {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [editingQuiz, setEditingQuiz] = useState(null);

    /* ======================================================
       LOAD QUIZZES
    ====================================================== */

    const refreshQuizzes = useCallback(async () => {
        const { data, error } = await supabase
            .from("bible_quizzes")
            .select("*")
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            console.error("Error loading quizzes:", error);
            return;
        }

        setQuizzes(data ?? []);
    }, []);

    /* ======================================================
       INITIAL LOAD + REALTIME
    ====================================================== */

    useEffect(() => {
        void refreshQuizzes();

        const channel = supabase
            .channel("bible-quizzes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bible_quizzes",
                },
                () => {
                    void refreshQuizzes();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [refreshQuizzes]);

    /* ======================================================
       MANAGE QUESTIONS
    ====================================================== */

    const handleManageQuestions = (quiz) => {
        setSelectedQuiz(quiz);
    };

    /* ======================================================
       EDIT QUIZ
    ====================================================== */

    const handleEditQuiz = (quiz) => {
        setEditingQuiz(quiz);

        // Scroll back to the quiz form
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    /* ======================================================
       DELETE QUIZ
    ====================================================== */

    const handleDeleteQuiz = async (quiz) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${quiz.title}"?\n\nThis will delete the quiz, its questions, answers, results, and attempt answers.`
        );

        if (!confirmed) return;

        try {
            /* ==================================================
               1. LOAD QUESTIONS
            ================================================== */

            const { data: questions, error: questionLoadError } =
                await supabase
                    .from("bible_quiz_questions")
                    .select("id")
                    .eq("quiz_id", quiz.id);

            if (questionLoadError) {
                throw questionLoadError;
            }

            const questionIds =
                questions?.map((question) => question.id) ?? [];

            /* ==================================================
               2. LOAD RESULTS
            ================================================== */

            const { data: results, error: resultsLoadError } =
                await supabase
                    .from("bible_quiz_results")
                    .select("id")
                    .eq("quiz_id", quiz.id);

            if (resultsLoadError) {
                throw resultsLoadError;
            }

            const resultIds =
                results?.map((result) => result.id) ?? [];

            /* ==================================================
               3. DELETE ATTEMPT ANSWERS
            ================================================== */

            if (resultIds.length > 0) {
                const { error: attemptAnswersError } =
                    await supabase
                        .from("bible_quiz_attempt_answers")
                        .delete()
                        .in("result_id", resultIds);

                if (attemptAnswersError) {
                    throw attemptAnswersError;
                }
            }

            /* ==================================================
               4. DELETE RESULTS
            ================================================== */

            if (resultIds.length > 0) {
                const { error: resultsError } = await supabase
                    .from("bible_quiz_results")
                    .delete()
                    .in("id", resultIds);

                if (resultsError) {
                    throw resultsError;
                }
            }

            /* ==================================================
               5. DELETE ANSWERS
            ================================================== */

            if (questionIds.length > 0) {
                const { error: answersError } = await supabase
                    .from("bible_quiz_answers")
                    .delete()
                    .in("question_id", questionIds);

                if (answersError) {
                    throw answersError;
                }
            }

            /* ==================================================
               6. DELETE QUESTIONS
            ================================================== */

            if (questionIds.length > 0) {
                const { error: questionsError } = await supabase
                    .from("bible_quiz_questions")
                    .delete()
                    .eq("quiz_id", quiz.id);

                if (questionsError) {
                    throw questionsError;
                }
            }

            /* ==================================================
               7. DELETE QUIZ
            ================================================== */

            const { error: quizError } = await supabase
                .from("bible_quizzes")
                .delete()
                .eq("id", quiz.id);

            if (quizError) {
                throw quizError;
            }

            /* ==================================================
               8. CLOSE EDIT MODE
            ================================================== */

            if (editingQuiz?.id === quiz.id) {
                setEditingQuiz(null);
            }

            /* ==================================================
               9. CLOSE QUESTION MANAGER
            ================================================== */

            if (selectedQuiz?.id === quiz.id) {
                setSelectedQuiz(null);
            }

            /* ==================================================
               10. REFRESH
            ================================================== */

            await refreshQuizzes();

            alert("✅ Quiz deleted successfully.");

        } catch (error) {
            console.error("Delete quiz error:", error);

            alert(
                error?.message ||
                "Something went wrong while deleting the quiz."
            );
        }
    };

    /* ======================================================
       STATISTICS
    ====================================================== */

    const handleStatistics = () => {

        alert(
            "Quiz statistics will be added next."
        );
    };

    /* ======================================================
       QUESTION MANAGER
    ====================================================== */

    if (selectedQuiz) {
        return (
            <BibleQuestionManager
                quiz={selectedQuiz}
                onBack={() => {
                    setSelectedQuiz(null);
                    void refreshQuizzes();
                }}
            />
        );
    }

    async function publishQuiz(quiz) {
        const confirmed = window.confirm(
            `Publish "${quiz.title}"?\n\n` +
            "This quiz will become the active Bible challenge.\n\n" +
            "Any other active quiz will be deactivated."
        );

        if (!confirmed) return;

        try {

            // ==================================================
            // 1. Find the currently active quiz
            // ==================================================

            const {
                data: activeQuiz,
                error: activeQuizError,
            } = await supabase
                .from("bible_quizzes")
                .select("id, title")
                .eq("is_active", true)
                .neq("id", quiz.id)
                .maybeSingle();

            if (activeQuizError) {
                throw activeQuizError;
            }

            // ==================================================
            // 2. Deactivate current active quiz
            // ==================================================

            if (activeQuiz) {

                const {
                    data: deactivatedQuiz,
                    error: deactivateError,
                } = await supabase
                    .from("bible_quizzes")
                    .update({
                        is_active: false,
                    })
                    .eq("id", activeQuiz.id)
                    .select("id, title, is_active")
                    .single();

                if (deactivateError) {
                    throw deactivateError;
                }
            }

            // ==================================================
            // 3. Activate selected quiz
            // ==================================================

            const {
                data: publishedQuiz,
                error: publishError,
            } = await supabase
                .from("bible_quizzes")
                .update({
                    is_active: true,
                    published_at: new Date().toISOString(),
                })
                .eq("id", quiz.id)
                .select("id, title, is_active, published_at")
                .single();

            if (publishError) {
                throw publishError;
            }

            // ==================================================
            // 4. Refresh
            // ==================================================

            await refreshQuizzes();

            alert(
                `✅ "${quiz.title}" is now the active Bible challenge.`
            );

        } catch (error) {
            console.error(
                "❌ PUBLISH QUIZ FAILED:",
                error
            );

            alert(
                `Unable to publish quiz:\n\n${error?.message || error}`
            );
        }
    }


    async function deactivateQuiz(quiz) {
        const confirmed = window.confirm(
            `Deactivate "${quiz.title}"?\n\n` +
            "Users will no longer be able to access it as the active quiz."
        );

        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from("bible_quizzes")
                .update({
                    is_active: false,
                })
                .eq("id", quiz.id);

            if (error) throw error;

            alert("Quiz deactivated successfully.");

            await refreshQuizzes();

        } catch (error) {
            console.error("Error deactivating quiz:", error);
            alert(`Unable to deactivate quiz:\n\n${error.message}`);
        }
    }
    /* ======================================================
       MAIN UI
    ====================================================== */

    return (
        <div className="space-y-8">

            {/* ==================================================
               HEADER
            ================================================== */}

            <div>
                <p className="text-xs uppercase tracking-[0.3em] text-purple-500 mb-2">
                    Weekly Scripture Challenge
                </p>

                <h2 className="text-3xl font-bold text-gray-900">
                    Bible Quizzes
                </h2>

                <p className="text-gray-500 mt-2">
                    Create and manage your weekly Bible quizzes.
                </p>
            </div>

            {/* ==================================================
               QUIZ FORM
            ================================================== */}

            <QuizForm
                editingQuiz={editingQuiz}
                setEditingQuiz={setEditingQuiz}
                refreshQuizzes={refreshQuizzes}
            />

            {/* ==================================================
               QUIZ LIST
            ================================================== */}

            <section className="space-y-5">

                {quizzes.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center">

                        <div className="text-5xl mb-4">
                            📖
                        </div>

                        <h3 className="text-xl font-bold text-gray-900">
                            No Bible quizzes yet
                        </h3>

                        <p className="text-gray-500 mt-2">
                            Create your first weekly Bible quiz above.
                        </p>

                    </div>
                ) : (
                    quizzes.map((quiz) => (
                        <QuizCard
                            key={quiz.id}
                            quiz={quiz}
                            onManage={() =>
                                handleManageQuestions(quiz)
                            }
                            onEdit={() =>
                                handleEditQuiz(quiz)
                            }
                            onDelete={() =>
                                handleDeleteQuiz(quiz)
                            }
                            onStatistics={() =>
                                handleStatistics(quiz)
                            }
                            onPublish={() =>
                                publishQuiz(quiz)
                            }
                            onDeactivate={() =>
                                deactivateQuiz(quiz)
                            }
                        />
                    ))
                )}

            </section>

        </div>
    );
}