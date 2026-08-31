import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import QuestionForm from "./QuestionForm";
import QuestionCard from "./QuestionCard";

export default function BibleQuestionManager({ quiz, onBack }) {
    const [questions, setQuestions] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [deletingQuestionId, setDeletingQuestionId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const refreshQuestions = useCallback(async () => {
        const { data, error } = await supabase
            .from("bible_quiz_questions")
            .select(`
                *,
                bible_quiz_answers(*)
            `)
            .eq("quiz_id", quiz.id)
            .order("order_number", { ascending: true });

        if (error) {
            console.error(error);
            return;
        }

        setQuestions(data ?? []);
    }, [quiz.id]);

    useEffect(() => {
        void refreshQuestions();

        const channel = supabase
            .channel(`quiz-${quiz.id}-questions`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bible_quiz_questions",
                },
                refreshQuestions
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bible_quiz_answers",
                },
                refreshQuestions
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [quiz.id, refreshQuestions]);

    async function deleteQuestion(id) {
        const question = questions.find(
            (item) => item.id === id
        );

        const confirmed = window.confirm(
            `Delete "Question ${question?.order_number ?? ""}"?\n\n` +
            "This will permanently delete the question and its answers."
        );

        if (!confirmed) return;

        try {
            setDeletingQuestionId(id);
            setSuccessMessage("");
            setErrorMessage("");

            // ---------------------------------------------
            // Get answers
            // ---------------------------------------------

            const { data: answers, error: answersLoadError } =
                await supabase
                    .from("bible_quiz_answers")
                    .select("id")
                    .eq("question_id", id);

            if (answersLoadError) {
                throw answersLoadError;
            }

            // ---------------------------------------------
            // Delete answers first
            // ---------------------------------------------

            if (answers?.length > 0) {
                const answerIds = answers.map(
                    (answer) => answer.id
                );

                const { error: answersDeleteError } =
                    await supabase
                        .from("bible_quiz_answers")
                        .delete()
                        .in("id", answerIds);

                if (answersDeleteError) {
                    throw answersDeleteError;
                }
            }

            // ---------------------------------------------
            // Delete question
            // ---------------------------------------------

            const { error: questionDeleteError } =
                await supabase
                    .from("bible_quiz_questions")
                    .delete()
                    .eq("id", id);

            if (questionDeleteError) {
                throw questionDeleteError;
            }

            // ---------------------------------------------
            // Refresh
            // ---------------------------------------------

            await refreshQuestions();

            setSuccessMessage(
                `Question ${question?.order_number ?? ""} deleted successfully.`
            );

            setTimeout(() => {
                setSuccessMessage("");
            }, 4000);

        } catch (error) {
            console.error(
                "❌ DELETE FAILED:",
                error
            );

            setErrorMessage(
                `Unable to delete question: ${
                    error.message || error
                }`
            );

            setTimeout(() => {
                setErrorMessage("");
            }, 5000);

        } finally {
            setDeletingQuestionId(null);
        }
    }

    async function duplicateQuestion(question) {
        try {
            const confirmed = window.confirm(
                `Duplicate "Question ${question.order_number}"?`
            );

            if (!confirmed) return;

            // =====================================================
            // LOAD EXISTING QUESTIONS
            // =====================================================

            const {
                data: existingQuestions,
                error: orderError,
            } = await supabase
                .from("bible_quiz_questions")
                .select("id, order_number")
                .eq("quiz_id", quiz.id);

            if (orderError) {
                console.error(
                    "❌ Error loading questions:",
                    orderError
                );

                throw orderError;
            }

            // =====================================================
            // CALCULATE NEXT ORDER
            // =====================================================

            const highestOrder = Math.max(
                0,
                ...(existingQuestions || []).map(
                    (item) =>
                        Number(item.order_number) || 0
                )
            );

            const nextOrder = highestOrder + 1;

            // =====================================================
            // CREATE DUPLICATED QUESTION
            // =====================================================

            const {
                data: newQuestion,
                error: questionError,
            } = await supabase
                .from("bible_quiz_questions")
                .insert({
                    quiz_id: quiz.id,
                    question: question.question,
                    bible_reference:
                        question.bible_reference || null,
                    difficulty:
                        question.difficulty || "Easy",
                    points:
                        question.points || 1,
                    image_url:
                        question.image_url || null,
                    explanation:
                        question.explanation || null,
                    order_number: nextOrder,
                })
                .select()
                .single();

            if (questionError) {
                console.error(
                    "❌ Error creating duplicated question:",
                    questionError
                );

                throw questionError;
            }

            // =====================================================
            // PREPARE ANSWERS
            // =====================================================

            const originalAnswers =
                question.bible_quiz_answers || [];

            const answerRows = originalAnswers.map(
                (answer) => ({
                    question_id: newQuestion.id,
                    option_letter:
                    answer.option_letter,
                    answer: answer.answer,
                    display_order:
                    answer.display_order,
                    is_correct:
                    answer.is_correct,
                })
            );

            // =====================================================
            // CREATE ANSWERS
            // =====================================================

            if (answerRows.length > 0) {
                const {
                    error: answerError,
                } = await supabase
                    .from("bible_quiz_answers")
                    .insert(answerRows);

                if (answerError) {
                    console.error(
                        "❌ Error creating duplicated answers:",
                        answerError
                    );

                    // Remove question if answers fail
                    await supabase
                        .from("bible_quiz_questions")
                        .delete()
                        .eq("id", newQuestion.id);

                    throw answerError;
                }
            }

            // =====================================================
            // REFRESH
            // =====================================================

            await refreshQuestions();

            alert(
                `Question duplicated successfully as Question ${nextOrder}.`
            );

        } catch (error) {
            console.error(
                "❌ DUPLICATE QUESTION FAILED:",
                error
            );

            alert(
                `Unable to duplicate question:\n\n${
                    error?.message || error
                }`
            );
        }
    }

    return (
        <div className="space-y-8">

            <button
                onClick={onBack}
                className="text-purple-600 hover:text-purple-500 font-semibold"
            >
                ← Back to Quizzes
            </button>

            <div>

                <h1 className="text-4xl font-bold">
                    {quiz.title}
                </h1>

                <p className="text-gray-500 mt-2">
                    {questions.length} Question
                    {questions.length !== 1 && "s"}
                </p>

                {successMessage && (
                    <div
                        className="mt-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-4">
                        <span className="text-xl">✓</span>

                        <span className="font-medium">{successMessage}</span>
                    </div>
                )}

                {errorMessage && (
                    <div
                        className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
                        <span className="text-xl">!</span>

                        <span className="font-medium">{errorMessage}</span>
                    </div>
                )}

            </div>

            <QuestionForm
                quiz={quiz}
                editingQuestion={editingQuestion}
                onCancel={() => setEditingQuestion(null)}
                refreshQuestions={refreshQuestions}
                setEditingQuestion={setEditingQuestion}
            />

            <section className="space-y-6">

                {questions.length === 0 && (

                    <div className="bg-white rounded-3xl border p-12 text-center text-gray-500">

                        No questions have been created yet.

                    </div>

                )}

                {questions.map((question) => (

                    <QuestionCard
                        key={question.id}
                        question={question}
                        onEdit={() => setEditingQuestion(question)}
                        onDuplicate={() => duplicateQuestion(question)}
                        onDelete={() => deleteQuestion(question.id)}
                        deleting={deletingQuestionId === question.id}
                    />

                ))}

            </section>

        </div>
    );
}