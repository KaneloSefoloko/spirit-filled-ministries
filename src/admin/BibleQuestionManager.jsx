import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import QuestionForm from "./QuestionForm";
import QuestionCard from "./QuestionCard";

export default function BibleQuestionManager({ quiz, onBack }) {
    const [questions, setQuestions] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);

    const [loading, setLoading] = useState(true);
    const [deletingQuestionId, setDeletingQuestionId] = useState(null);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    /* ======================================================
       LOAD QUESTIONS
    ====================================================== */

    const refreshQuestions = useCallback(async () => {
        if (!quiz?.id) {
            setQuestions([]);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("bible_quiz_questions")
                .select(`*,bible_quiz_answers(*)`)
                .eq("quiz_id", quiz.id)
                .order("order_number", {
                    ascending: true,
                });

            if (error) {
                throw error;
            }

            setQuestions(data ?? []);
        } catch (error) {
            console.error(
                "Error loading quiz questions:",
                error
            );

            setErrorMessage(
                error?.message ||
                "Unable to load quiz questions."
            );

            setTimeout(() => {
                setErrorMessage("");
            }, 5000);
        } finally {
            setLoading(false);
        }
    }, [quiz?.id]);


    /* ======================================================
       INITIAL LOAD + REALTIME
    ====================================================== */

    useEffect(() => {
        if (!quiz?.id) {
            return;
        }

        setLoading(true);

        void refreshQuestions();

        const channel = supabase
            .channel(`quiz-${quiz.id}-questions-manager`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bible_quiz_questions",
                    filter: `quiz_id=eq.${quiz.id}`,
                },
                () => {
                    void refreshQuestions();
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bible_quiz_answers",
                },
                () => {
                    void refreshQuestions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [quiz?.id, refreshQuestions]);


    /* ======================================================
       CLEAR EDITING QUESTION IF IT NO LONGER EXISTS
    ====================================================== */

    useEffect(() => {
        if (!editingQuestion) {
            return;
        }

        const stillExists = questions.some(
            (question) =>
                question.id === editingQuestion.id
        );

        if (!stillExists) {
            setEditingQuestion(null);
        }
    }, [questions, editingQuestion]);


    /* ======================================================
       MESSAGE HELPERS
    ====================================================== */

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setErrorMessage("");

        setTimeout(() => {
            setSuccessMessage("");
        }, 4000);
    };

    const showError = (message) => {
        setErrorMessage(message);
        setSuccessMessage("");

        setTimeout(() => {
            setErrorMessage("");
        }, 5000);
    };


    /* ======================================================
       DELETE QUESTION
    ====================================================== */

    const deleteQuestion = async (id) => {
        const question = questions.find(
            (item) => item.id === id
        );

        if (!question) {
            showError("Question could not be found.");
            return;
        }

        const confirmed = window.confirm(
            `Delete "Question ${question.order_number ?? ""}"?\n\n` +
            "This will permanently delete the question and all of its answers."
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingQuestionId(id);
            setSuccessMessage("");
            setErrorMessage("");

            /*
             * Delete answers first.
             *
             * We do this explicitly rather than relying on
             * database cascade behaviour.
             */

            const {
                error: answersDeleteError,
            } = await supabase
                .from("bible_quiz_answers")
                .delete()
                .eq("question_id", id);

            if (answersDeleteError) {
                throw answersDeleteError;
            }


            /*
             * Delete question.
             */

            const {
                error: questionDeleteError,
            } = await supabase
                .from("bible_quiz_questions")
                .delete()
                .eq("id", id);

            if (questionDeleteError) {
                throw questionDeleteError;
            }


            /*
             * Leave edit mode if this was the question
             * currently being edited.
             */

            if (editingQuestion?.id === id) {
                setEditingQuestion(null);
            }


            /*
             * Refresh UI.
             */

            await refreshQuestions();

            showSuccess(
                `Question ${question.order_number ?? ""} deleted successfully.`
            );

        } catch (error) {
            console.error(
                "❌ DELETE QUESTION FAILED:",
                error
            );

            showError(
                error?.message ||
                "Unable to delete question."
            );

        } finally {
            setDeletingQuestionId(null);
        }
    };


    /* ======================================================
       DUPLICATE QUESTION
    ====================================================== */

    const duplicateQuestion = async (question) => {
        const confirmed = window.confirm(
            `Duplicate "Question ${question.order_number ?? ""}"?\n\n` +
            "A new copy will be added to the end of this quiz."
        );

        if (!confirmed) {
            return;
        }

        try {
            setSuccessMessage("");
            setErrorMessage("");

            /*
             * Get the current highest question order.
             */

            const {
                data: existingQuestions,
                error: orderError,
            } = await supabase
                .from("bible_quiz_questions")
                .select("order_number")
                .eq("quiz_id", quiz.id);

            if (orderError) {
                throw orderError;
            }


            const highestOrder = Math.max(
                0,
                ...(existingQuestions ?? []).map(
                    (item) =>
                        Number(item.order_number) || 0
                )
            );

            const nextOrder = highestOrder + 1;


            /*
             * Create the duplicated question.
             */

            const {
                data: newQuestion,
                error: questionError,
            } = await supabase
                .from("bible_quiz_questions")
                .insert({
                    quiz_id: quiz.id,

                    question:
                        question.question,

                    bible_reference:
                        question.bible_reference || null,

                    difficulty:
                        question.difficulty || "Easy",

                    points:
                        Number(question.points) || 1,

                    image_url:
                        question.image_url || null,

                    explanation:
                        question.explanation || null,

                    order_number:
                        nextOrder,
                })
                .select()
                .single();

            if (questionError) {
                throw questionError;
            }


            /*
             * Duplicate answer options.
             */

            const originalAnswers =
                question.bible_quiz_answers ?? [];

            const answerRows = originalAnswers.map(
                (answer, index) => ({
                    question_id:
                        newQuestion.id,

                    option_letter:
                        answer.option_letter ||
                        String.fromCharCode(
                            65 + index
                        ),

                    answer:
                        answer.answer?.trim() || "",

                    display_order:
                        answer.display_order ??
                        index + 1,

                    is_correct:
                        Boolean(answer.is_correct),
                })
            );


            /*
             * Insert answers.
             */

            if (answerRows.length > 0) {
                const {
                    error: answerError,
                } = await supabase
                    .from("bible_quiz_answers")
                    .insert(answerRows);

                if (answerError) {

                    /*
                     * Roll back the duplicated question
                     * if answer creation fails.
                     */

                    await supabase
                        .from("bible_quiz_questions")
                        .delete()
                        .eq("id", newQuestion.id);

                    throw answerError;
                }
            }


            /*
             * Refresh list.
             */

            await refreshQuestions();

            showSuccess(
                `Question duplicated successfully as Question ${nextOrder}.`
            );

        } catch (error) {
            console.error(
                "❌ DUPLICATE QUESTION FAILED:",
                error
            );

            showError(
                error?.message ||
                "Unable to duplicate question."
            );
        }
    };


    /* ======================================================
       EDIT QUESTION
    ====================================================== */

    const handleEdit = (question) => {
        setEditingQuestion(question);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    /* ======================================================
       CANCEL EDIT
    ====================================================== */

    const handleCancelEdit = () => {
        setEditingQuestion(null);
    };


    /* ======================================================
       LOADING
    ====================================================== */

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">

                <div className="text-center">

                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />

                    <p className="text-gray-500 mt-4">
                        Loading Bible quiz questions...
                    </p>

                </div>

            </div>
        );
    }


    /* ======================================================
       NO QUIZ
    ====================================================== */

    if (!quiz?.id) {
        return (
            <div className="bg-white rounded-3xl border border-red-200 p-10 text-center">

                <div className="text-4xl mb-4">
                    ⚠️
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                    No quiz selected
                </h2>

                <p className="text-gray-500 mt-2">
                    Please return to the Bible Quiz manager
                    and select a quiz.
                </p>

                <button
                    type="button"
                    onClick={onBack}
                    className="mt-6 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                    ← Back to Quizzes
                </button>

            </div>
        );
    }


    /* ======================================================
       UI
    ====================================================== */

    return (
        <div className="space-y-8">

            {/* ==================================================
                BACK
            ================================================== */}

            <button
                type="button"
                onClick={onBack}
                className="text-purple-600 hover:text-purple-500 font-semibold transition"
            >
                ← Back to Quizzes
            </button>


            {/* ==================================================
                QUIZ HEADER
            ================================================== */}

            <div>

                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

                    <div>

                        <p className="text-xs uppercase tracking-[0.3em] text-purple-500 font-semibold mb-2">
                            Scripture Challenge
                        </p>

                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            {quiz.title}
                        </h1>

                        {quiz.description && (
                            <p className="text-gray-500 mt-3 max-w-3xl">
                                {quiz.description}
                            </p>
                        )}

                    </div>

                    <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold text-sm self-start lg:self-auto">
                        {questions.length} Question
                        {questions.length !== 1
                            ? "s"
                            : ""}
                    </div>

                </div>


                {/* ==================================================
                    QUIZ STATUS
                ================================================== */}

                <div className="flex flex-wrap gap-2 mt-4">

                    {quiz.published_at ? (
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                            Published
                        </span>
                    ) : (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                            Draft
                        </span>
                    )}

                    {quiz.is_active && (
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            Active
                        </span>
                    )}

                    {quiz.week_number && (
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                            Week {quiz.week_number}
                        </span>
                    )}

                    {quiz.year && (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                            {quiz.year}
                        </span>
                    )}

                </div>


                {/* ==================================================
                    MESSAGES
                ================================================== */}

                {successMessage && (
                    <div className="mt-5 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-4">

                        <span className="text-xl">
                            ✓
                        </span>

                        <span className="font-medium">
                            {successMessage}
                        </span>

                    </div>
                )}

                {errorMessage && (
                    <div className="mt-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">

                        <span className="text-xl">
                            !
                        </span>

                        <span className="font-medium">
                            {errorMessage}
                        </span>

                    </div>
                )}

            </div>


            {/* ==================================================
                QUESTION FORM
            ================================================== */}

            <QuestionForm
                quiz={quiz}
                editingQuestion={editingQuestion}
                onCancel={handleCancelEdit}
                refreshQuestions={refreshQuestions}
                setEditingQuestion={setEditingQuestion}
            />


            {/* ==================================================
                QUESTIONS
            ================================================== */}

            <section className="space-y-6">

                {questions.length === 0 ? (

                    <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center">

                        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto text-3xl">
                            📖
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mt-5">
                            No questions yet
                        </h3>

                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            Create your first Bible quiz question
                            using the form above.
                        </p>

                    </div>

                ) : (

                    questions.map((question) => (

                        <QuestionCard
                            key={question.id}
                            question={question}
                            onEdit={() =>
                                handleEdit(question)
                            }
                            onDuplicate={() =>
                                duplicateQuestion(question)
                            }
                            onDelete={() =>
                                deleteQuestion(question.id)
                            }
                            deleting={
                                deletingQuestionId ===
                                question.id
                            }
                        />

                    ))

                )}

            </section>

        </div>
    );
}