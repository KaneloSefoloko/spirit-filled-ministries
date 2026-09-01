import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import QuizForm from "./QuizForm";
import QuizCard from "./QuizCard";

export default function BibleQuizManager({
                                             onManageQuestions,
                                             onStatistics,
                                         }) {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingQuiz, setEditingQuiz] = useState(null);

    /* ======================================================
       LOAD QUIZZES
    ====================================================== */

    const loadQuizzes = useCallback(async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("bible_quizzes")
                .select("*")
                .order("year", { ascending: false })
                .order("week_number", { ascending: false });

            if (error) {
                throw error;
            }

            setQuizzes(data || []);
        } catch (error) {
            console.error("Error loading quizzes:", error);

            alert(
                error?.message ||
                "Unable to load Bible quizzes."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadQuizzes();
    }, [loadQuizzes]);


    /* ======================================================
       PUBLISH / ACTIVATE QUIZ

       DRAFT
           published_at = null
           is_active = false

       PUBLISHED
           published_at = timestamp
           is_active = false

       ACTIVE
           published_at = timestamp
           is_active = true

       IMPORTANT:
       Only ONE quiz can be active at a time.
    ====================================================== */

    const handlePublish = async (quiz) => {
        const isAlreadyPublished = Boolean(quiz.published_at);

        /* ==================================================
           ACTIVATE ALREADY-PUBLISHED QUIZ
        ================================================== */

        if (isAlreadyPublished) {
            const confirmed = window.confirm(
                `Activate "${quiz.title}"?\n\n` +
                "This will make it the current active Bible quiz. " +
                "Any other active quiz will be deactivated."
            );

            if (!confirmed) {
                return;
            }

            try {
                /*
                 * First deactivate every other active quiz.
                 *
                 * This guarantees that only one quiz is active.
                 */

                const { error: deactivateError } = await supabase
                    .from("bible_quizzes")
                    .update({
                        is_active: false,
                    })
                    .eq("is_active", true)
                    .neq("id", quiz.id);

                if (deactivateError) {
                    throw deactivateError;
                }

                /*
                 * Now activate this quiz.
                 *
                 * published_at is deliberately NOT changed.
                 */

                const { error: activateError } = await supabase
                    .from("bible_quizzes")
                    .update({
                        is_active: true,
                    })
                    .eq("id", quiz.id);

                if (activateError) {
                    throw activateError;
                }

                alert("✅ Quiz activated successfully.");

                await loadQuizzes();

            } catch (error) {
                console.error(
                    "Quiz activation error:",
                    error
                );

                alert(
                    error?.message ||
                    "Unable to activate the quiz."
                );
            }

            return;
        }


        /* ==================================================
           PUBLISH DRAFT
        ================================================== */

        const confirmed = window.confirm(
            `Publish "${quiz.title}"?\n\n` +
            "The quiz will become publicly published, but it will NOT become active automatically."
        );

        if (!confirmed) {
            return;
        }

        try {
            const { error } = await supabase
                .from("bible_quizzes")
                .update({
                    published_at: new Date().toISOString(),

                    /*
                     * Publishing does NOT activate the quiz.
                     */
                    is_active: false,
                })
                .eq("id", quiz.id);

            if (error) {
                throw error;
            }

            alert(
                "✅ Quiz published successfully.\n\n" +
                "The quiz is now publicly published but remains inactive.\n\n" +
                "Use 'Activate Quiz' when you want it to become the current Bible quiz."
            );

            await loadQuizzes();

        } catch (error) {
            console.error(
                "Quiz publishing error:",
                error
            );

            alert(
                error?.message ||
                "Unable to publish the quiz."
            );
        }
    };


    /* ======================================================
       DEACTIVATE QUIZ

       The quiz remains published.

       Only:
           is_active = false

       published_at remains unchanged.
    ====================================================== */

    const handleDeactivate = async (quiz) => {
        const confirmed = window.confirm(
            `Deactivate "${quiz.title}"?\n\n` +
            "The quiz will remain published, but it will no longer be the active Bible quiz."
        );

        if (!confirmed) {
            return;
        }

        try {
            const { error } = await supabase
                .from("bible_quizzes")
                .update({
                    is_active: false,
                })
                .eq("id", quiz.id);

            if (error) {
                throw error;
            }

            alert("✅ Quiz deactivated successfully.");

            await loadQuizzes();

        } catch (error) {
            console.error(
                "Quiz deactivation error:",
                error
            );

            alert(
                error?.message ||
                "Unable to deactivate the quiz."
            );
        }
    };


    /* ======================================================
       DELETE QUIZ
    ====================================================== */

    const handleDelete = async (quiz) => {
        const confirmed = window.confirm(
            `Delete "${quiz.title}"?\n\n` +
            "This will permanently delete the quiz and its questions and answers.\n\n" +
            "This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            const { error } = await supabase
                .from("bible_quizzes")
                .delete()
                .eq("id", quiz.id);

            if (error) {
                throw error;
            }

            /*
             * If the deleted quiz was being edited,
             * leave edit mode.
             */

            if (editingQuiz?.id === quiz.id) {
                setEditingQuiz(null);
            }

            alert("✅ Quiz deleted successfully.");

            await loadQuizzes();

        } catch (error) {
            console.error(
                "Quiz delete error:",
                error
            );

            alert(
                error?.message ||
                "Unable to delete the quiz."
            );
        }
    };


    /* ======================================================
       EDIT QUIZ
    ====================================================== */

    const handleEdit = (quiz) => {
        setEditingQuiz(quiz);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    /* ======================================================
       CANCEL EDIT
    ====================================================== */

    const handleCancelEdit = () => {
        setEditingQuiz(null);
    };


    /* ======================================================
       LOADING
    ====================================================== */

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">

                <div className="text-center">

                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />

                    <p className="text-gray-500 mt-4">
                        Loading Bible quizzes...
                    </p>

                </div>

            </div>
        );
    }


    /* ======================================================
       UI
    ====================================================== */

    return (
        <div className="space-y-10">

            {/* ==================================================
                QUIZ FORM
            ================================================== */}

            <QuizForm
                editingQuiz={editingQuiz}
                setEditingQuiz={setEditingQuiz}
                refreshQuizzes={loadQuizzes}
            />


            {/* ==================================================
                QUIZ LIST HEADER
            ================================================== */}

            <div>

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">

                    <div>

                        <p className="text-xs uppercase tracking-[0.3em] text-purple-500 font-semibold mb-2">
                            Scripture Challenges
                        </p>

                        <h2 className="text-3xl font-bold text-gray-900">
                            Bible Quizzes
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Manage your weekly Bible quizzes, questions,
                            publication status, and activity.
                        </p>

                    </div>

                    <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold text-sm">
                        {quizzes.length} Quiz
                        {quizzes.length !== 1 ? "zes" : ""}
                    </div>

                </div>


                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {quizzes.length === 0 ? (

                    <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center">

                        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto text-3xl">
                            📖
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mt-5">
                            No Bible quizzes yet
                        </h3>

                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            Create your first weekly Bible quiz above,
                            then add questions and answers.
                        </p>

                    </div>

                ) : (

                    /* ==================================================
                       QUIZ CARDS
                    ================================================== */

                    <div className="space-y-6">

                        {quizzes.map((quiz) => (

                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}

                                onManage={onManageQuestions}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onStatistics={onStatistics}

                                /*
                                 * QuizCard uses this callback for both:
                                 *
                                 * Draft       → Publish Quiz
                                 * Published  → Activate Quiz
                                 */
                                onPublish={handlePublish}

                                /*
                                 * Published + Active → Deactivate
                                 */
                                onDeactivate={handleDeactivate}
                            />

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}