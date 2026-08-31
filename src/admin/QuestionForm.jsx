import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AnswerFields from "./AnswerFields";
import { useAuth } from "../context/AuthContext";

const createEmptyAnswers = () => [
    {
        option_letter: "A",
        answer: "",
        display_order: 1,
    },
    {
        option_letter: "B",
        answer: "",
        display_order: 2,
    },
    {
        option_letter: "C",
        answer: "",
        display_order: 3,
    },
    {
        option_letter: "D",
        answer: "",
        display_order: 4,
    },
];

export default function QuestionForm({
                                         quiz,
                                         editingQuestion,
                                         refreshQuestions,
                                         setEditingQuestion,
                                         onCancel,
                                     }) {
    const { session, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [answers, setAnswers] = useState(createEmptyAnswers());
    const [question, setQuestion] = useState("");
    const [bibleReference, setBibleReference] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [points, setPoints] = useState(1);
    const [imageUrl, setImageUrl] = useState("");
    const [explanation, setExplanation] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState("A");


    function resetForm() {
        setQuestion("");
        setBibleReference("");
        setDifficulty("Easy");
        setPoints(1);
        setImageUrl("");
        setExplanation("");

        setAnswers(createEmptyAnswers());

        setCorrectAnswer("A");
    }

    useEffect(() => {

        if (!editingQuestion) {
            resetForm();
            return;
        }

        setQuestion(editingQuestion.question ?? "");
        setBibleReference(editingQuestion.bible_reference ?? "");
        setDifficulty(editingQuestion.difficulty ?? "Easy");
        setPoints(editingQuestion.points ?? 1);
        setImageUrl(editingQuestion.image_url ?? "");
        setExplanation(editingQuestion.explanation ?? "");

        const sortedAnswers = [
            ...(editingQuestion.bible_quiz_answers ?? []),
        ].sort(
            (a, b) =>
                a.display_order - b.display_order
        );

        if (sortedAnswers.length) {

            setAnswers(
                sortedAnswers.map(answer => ({
                    id: answer.id,
                    option_letter: answer.option_letter,
                    answer: answer.answer,
                    display_order: answer.display_order,
                }))
            );

            const correct = sortedAnswers.find(
                answer => answer.is_correct
            );

            setCorrectAnswer(
                correct?.option_letter ?? "A"
            );
        }

    }, [editingQuestion]);

    async function createQuestion() {
        try {
            setLoading(true);
            setSuccessMessage("");

            if (!quiz?.id) {
                throw new Error("No quiz was selected.");
            }

            if (authLoading) {
                throw new Error("Authentication is still loading. Please wait and try again.");
            }

            if (!session?.user) {
                throw new Error("No active session found. Please log in again.");
            }

            const questionData = {
                quiz_id: quiz.id,
                question: question.trim(),
                bible_reference: bibleReference.trim() || null,
                difficulty,
                points: Number(points) || 1,
                image_url: imageUrl.trim() || null,
                explanation: explanation.trim() || null,
            };

            const {
                data: createdQuestion,
                error: questionError,
            } = await supabase
                .from("bible_quiz_questions")
                .insert(questionData)
                .select()
                .single();

            if (questionError) {
                throw questionError;
            }

            const answerRows = answers.map((answer) => ({
                question_id: createdQuestion.id,
                option_letter: answer.option_letter,
                answer: answer.answer.trim(),
                display_order: answer.display_order,
                is_correct:
                    answer.option_letter === correctAnswer,
            }));

            const { error: answerError } = await supabase
                .from("bible_quiz_answers")
                .insert(answerRows);

            if (answerError) {
                await supabase
                    .from("bible_quiz_questions")
                    .delete()
                    .eq("id", createdQuestion.id);

                throw answerError;
            }

            await refreshQuestions();

            resetForm();

            setSuccessMessage("Question created successfully!");

            setTimeout(() => {
                setSuccessMessage("");
            }, 4000);

        } catch (error) {
            console.error(error);

            alert(
                `Unable to save question:\n\n${
                    error?.message || "Unknown error"
                }`
            );
        } finally {
            setLoading(false);
        }
    }

    async function updateQuestion() {
        try {
            setLoading(true);

            const { error } = await supabase
                .from("bible_quiz_questions")
                .update({
                    question,
                    bible_reference: bibleReference,
                    difficulty,
                    points,
                    image_url: imageUrl,
                    explanation,
                })
                .eq("id", editingQuestion.id);

            if (error) throw error;

            // Update each answer individually
            for (const answer of answers) {

                const { error: answerError } = await supabase
                    .from("bible_quiz_answers")
                    .update({
                        answer: answer.answer,
                        is_correct:
                            answer.option_letter === correctAnswer,
                    })
                    .eq("id", answer.id);

                if (answerError) throw answerError;
            }

            resetForm();

            setEditingQuestion(null);

            await refreshQuestions();

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!question.trim()) {
            alert("Please enter a question.");
            return;
        }

        if (!bibleReference.trim()) {
            alert("Please enter the Bible reference.");
            return;
        }

        if (answers.some(answer => !answer.answer.trim())) {
            alert("Please complete all four answer options.");
            return;
        }

        const correctExists = answers.some(
            answer => answer.option_letter === correctAnswer
        );

        if (!correctExists) {
            alert("Please choose the correct answer.");
            return;
        }

        if (editingQuestion) {
            await updateQuestion();
        } else {
            await createQuestion();
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-lg border p-8 space-y-8"
        >
            {successMessage && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">✓</span>

                        <div>
                            <p className="font-semibold">
                                {successMessage}
                            </p>

                            <p className="text-sm text-green-600 mt-1">
                                The question and all four answers have been saved.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="border-b pb-6">

                <h2 className="text-3xl font-bold">

                    {editingQuestion
                        ? "Edit Bible Question"
                        : "Create Bible Question"}

                </h2>

                <p className="text-gray-500 mt-2">

                    Build engaging Bible quiz questions for your congregation.

                </p>

            </div>

            <div className="space-y-5">

                <div>

                    <label className="block mb-2 font-medium">
                        Question *
                    </label>

                    <textarea
                        rows={4}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Example: Who built the ark according to Genesis?"
                        className="w-full border rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />

                </div>

                <div className="grid md:grid-cols-2 gap-5">

                    <div>

                        <label className="block mb-2 font-medium">
                            Bible Reference
                        </label>

                        <input
                            value={bibleReference}
                            onChange={(e) => setBibleReference(e.target.value)}
                            placeholder="Genesis 6:14"
                            className="w-full border rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />

                    </div>

                    <div>

                        <label className="block mb-2 font-medium">
                            Difficulty
                        </label>

                        <select
                            value={difficulty}
                            onChange={(e) =>
                                setDifficulty(e.target.value)
                            }
                            className="w-full border rounded-2xl p-4"
                        >
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>

                    </div>

                </div>

                <div className="grid md:grid-cols-2 gap-5">

                    <div>

                        <label className="block mb-2 font-medium">
                            Points
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={points}
                            onChange={(e) =>
                                setPoints(Number(e.target.value))
                            }
                            className="w-full border rounded-2xl p-4"
                        />

                    </div>

                    <div>

                        <label className="block mb-2 font-medium">
                            Image URL (Optional)
                        </label>

                        <input
                            value={imageUrl}
                            onChange={(e) =>
                                setImageUrl(e.target.value)
                            }
                            className="w-full border rounded-2xl p-4"
                        />

                    </div>

                </div>

                <AnswerFields
                    answers={answers}
                    setAnswers={setAnswers}
                    correctAnswer={correctAnswer}
                    setCorrectAnswer={setCorrectAnswer}
                />

                <div>

                    <label className="block mb-2 font-medium">
                        Explanation
                    </label>

                    <textarea
                        rows={5}
                        value={explanation}
                        onChange={(e) =>
                            setExplanation(e.target.value)
                        }
                        className="w-full border rounded-2xl p-4"
                    />

                </div>

            </div>

            <div className="flex gap-4">

                <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-4 rounded-2xl font-semibold text-white transition-all ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-500"
                    }`}
                >
                    {loading
                        ? "Saving..."
                        : editingQuestion
                            ? "Update Question"
                            : "Save Question"}
                </button>

                {editingQuestion && (
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                            resetForm();
                            setEditingQuestion(null);
                            onCancel?.();
                        }}
                        className="border border-gray-300 hover:bg-gray-100 px-8 py-4 rounded-2xl font-semibold transition"
                    >
                        Cancel
                    </button>
                )}

            </div>

        </form>
    );
}