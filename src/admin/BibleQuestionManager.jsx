import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import QuestionForm from "./QuestionForm";
import QuestionCard from "./QuestionCard";

export default function BibleQuestionManager({ quiz, onBack }) {
    const [questions, setQuestions] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);

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
        const confirmed = window.confirm(
            "Delete this question?"
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("bible_quiz_questions")
            .delete()
            .eq("id", id);

        if (error) {
            alert(error.message);
        }
    }

    async function duplicateQuestion(question) {
        console.log("Duplicate:", question);

        // We'll implement this next.
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
                    />

                ))}

            </section>

        </div>
    );
}