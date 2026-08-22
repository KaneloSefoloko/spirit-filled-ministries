import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import QuizForm from "./QuizForm";
import QuizCard from "./QuizCard";
import BibleQuestionManager from "./BibleQuestionManager";

export default function BibleQuizManager() {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [editingQuiz, setEditingQuiz] = useState(null);

    const refreshQuizzes = useCallback(async () => {
        const { data, error } = await supabase
            .from("bible_quizzes")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        setQuizzes(data ?? []);
    }, []);

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
                refreshQuizzes
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [refreshQuizzes]);

    async function deleteQuiz(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this quiz?"
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("bible_quizzes")
            .delete()
            .eq("id", id);

        if (error) {
            alert(error.message);
        }
    }

    if (selectedQuiz) {
        return (
            <BibleQuestionManager
                quiz={selectedQuiz}
                onBack={() => setSelectedQuiz(null)}
            />
        );
    }

    return (
        <div className="space-y-8">

            <QuizForm
                editingQuiz={editingQuiz}
                setEditingQuiz={setEditingQuiz}
                refreshQuizzes={refreshQuizzes}
            />

            <section className="space-y-4">

                <h2 className="text-3xl font-bold">
                    Bible Quizzes
                </h2>

                {quizzes.length === 0 && (
                    <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">
                        No Bible quizzes have been created yet.
                    </div>
                )}

                {quizzes.map((quiz) => (

                    <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        onManage={() => setSelectedQuiz(quiz)}
                        onEdit={() => setEditingQuiz(quiz)}
                        onDelete={() => deleteQuiz(quiz.id)}
                    />

                ))}

            </section>

        </div>
    );
}