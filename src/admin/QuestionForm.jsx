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


    /* ======================================================
       RESET FORM
    ====================================================== */

    const resetForm = () => {
        setQuestion("");
        setBibleReference("");
        setDifficulty("Easy");
        setPoints(1);
        setImageUrl("");
        setExplanation("");

        setAnswers(createEmptyAnswers());

        setCorrectAnswer("A");
        setSuccessMessage("");
    };


    /* ======================================================
       LOAD QUESTION FOR EDITING
    ====================================================== */

    useEffect(() => {
        if (!editingQuestion) {
            resetForm();
            return;
        }

        setQuestion(editingQuestion.question ?? "");

        setBibleReference(
            editingQuestion.bible_reference ?? ""
        );

        setDifficulty(
            editingQuestion.difficulty ?? "Easy"
        );

        setPoints(
            editingQuestion.points ?? 1
        );

        setImageUrl(
            editingQuestion.image_url ?? ""
        );

        setExplanation(
            editingQuestion.explanation ?? ""
        );


        /*
         * Always create exactly four answer slots.
         *
         * This protects the form if Supabase returns
         * fewer than four answers.
         */

        const existingAnswers = [
            ...(editingQuestion.bible_quiz_answers ?? []),
        ].sort(
            (a, b) =>
                (a.display_order ?? 0) -
                (b.display_order ?? 0)
        );


        const normalizedAnswers = ["A", "B", "C", "D"].map(
            (letter, index) => {

                const existing = existingAnswers.find(
                    (answer) =>
                        answer.option_letter === letter
                );

                return {
                    id: existing?.id,
                    option_letter: letter,
                    answer: existing?.answer ?? "",
                    display_order:
                        existing?.display_order ?? index + 1,
                };
            }
        );


        setAnswers(normalizedAnswers);


        const correct = existingAnswers.find(
            (answer) => answer.is_correct
        );

        setCorrectAnswer(
            correct?.option_letter ?? "A"
        );

    }, [editingQuestion]);


    /* ======================================================
       CREATE QUESTION
    ====================================================== */

    const createQuestion = async () => {
        if (!quiz?.id) {
            throw new Error("No quiz was selected.");
        }

        const questionData = {
            quiz_id: quiz.id,
            question: question.trim(),
            bible_reference:
                bibleReference.trim() || null,
            difficulty,
            points: Number(points) || 1,
            image_url:
                imageUrl.trim() || null,
            explanation:
                explanation.trim() || null,
        };


        /*
         * Create question first.
         */

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


        /*
         * Create all four answers.
         */

        const answerRows = answers.map((answer, index) => ({
            question_id: createdQuestion.id,
            option_letter: answer.option_letter,
            answer: answer.answer.trim(),
            display_order:
                answer.display_order ?? index + 1,
            is_correct:
                answer.option_letter === correctAnswer,
        }));


        const {
            error: answerError,
        } = await supabase
            .from("bible_quiz_answers")
            .insert(answerRows);


        /*
         * If answer creation fails, remove the question
         * so we don't leave an orphaned question.
         */

        if (answerError) {

            await supabase
                .from("bible_quiz_questions")
                .delete()
                .eq("id", createdQuestion.id);

            throw answerError;
        }

        return createdQuestion;
    };


    /* ======================================================
       UPDATE QUESTION
    ====================================================== */

    const updateQuestion = async () => {

        if (!editingQuestion?.id) {
            throw new Error(
                "No question selected for editing."
            );
        }


        /*
         * Update question itself.
         */

        const {
            error: questionError,
        } = await supabase
            .from("bible_quiz_questions")
            .update({
                question: question.trim(),
                bible_reference:
                    bibleReference.trim() || null,
                difficulty,
                points: Number(points) || 1,
                image_url:
                    imageUrl.trim() || null,
                explanation:
                    explanation.trim() || null,
            })
            .eq("id", editingQuestion.id);


        if (questionError) {
            throw questionError;
        }


        /*
         * Make sure the database contains exactly
         * the four answer options A, B, C and D.
         *
         * We update existing answers and insert missing ones.
         */

        const existingAnswerIds = answers
            .filter((answer) => answer.id)
            .map((answer) => answer.id);


        /*
         * Remove stale answer rows that no longer belong
         * to the four options being edited.
         */

        if (existingAnswerIds.length > 0) {

            const {
                error: deleteError,
            } = await supabase
                .from("bible_quiz_answers")
                .delete()
                .eq("question_id", editingQuestion.id)
                .not(
                    "id",
                    "in",
                    `(${existingAnswerIds.join(",")})`
                );

            if (deleteError) {
                throw deleteError;
            }

        } else {

            /*
             * No existing answer IDs means all answer rows
             * need to be rebuilt.
             */

            const {
                error: deleteAllError,
            } = await supabase
                .from("bible_quiz_answers")
                .delete()
                .eq("question_id", editingQuestion.id);

            if (deleteAllError) {
                throw deleteAllError;
            }
        }


        /*
         * Update existing answers.
         */

        for (const answer of answers) {

            if (!answer.id) {
                continue;
            }

            const {
                error: answerError,
            } = await supabase
                .from("bible_quiz_answers")
                .update({
                    option_letter:
                        answer.option_letter,

                    answer:
                        answer.answer.trim(),

                    display_order:
                        answer.display_order,

                    is_correct:
                        answer.option_letter ===
                        correctAnswer,
                })
                .eq("id", answer.id)
                .eq(
                    "question_id",
                    editingQuestion.id
                );

            if (answerError) {
                throw answerError;
            }
        }


        /*
         * Insert answers that were missing.
         */

        const newAnswers = answers
            .filter((answer) => !answer.id)
            .map((answer) => ({
                question_id:
                    editingQuestion.id,

                option_letter:
                    answer.option_letter,

                answer:
                    answer.answer.trim(),

                display_order:
                    answer.display_order,

                is_correct:
                    answer.option_letter ===
                    correctAnswer,
            }));


        if (newAnswers.length > 0) {

            const {
                error: insertError,
            } = await supabase
                .from("bible_quiz_answers")
                .insert(newAnswers);

            if (insertError) {
                throw insertError;
            }
        }
    };


    /* ======================================================
       SUBMIT
    ====================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccessMessage("");


        /* ==================================================
           BASIC VALIDATION
        ================================================== */

        if (!question.trim()) {
            alert("Please enter a question.");
            return;
        }

        if (!bibleReference.trim()) {
            alert("Please enter the Bible reference.");
            return;
        }


        /*
         * Make absolutely sure we have A-D.
         */

        const requiredLetters = ["A", "B", "C", "D"];

        const hasAllLetters =
            requiredLetters.every((letter) =>
                answers.some(
                    (answer) =>
                        answer.option_letter === letter
                )
            );

        if (!hasAllLetters) {
            alert(
                "Please make sure all four answer options A, B, C and D are present."
            );
            return;
        }


        /*
         * Make sure every answer has text.
         */

        if (
            answers.some(
                (answer) =>
                    !answer.answer?.trim()
            )
        ) {
            alert(
                "Please complete all four answer options."
            );
            return;
        }


        /*
         * Make sure exactly one correct answer exists.
         */

        const correctAnswers = answers.filter(
            (answer) =>
                answer.option_letter ===
                correctAnswer
        );

        if (correctAnswers.length !== 1) {
            alert(
                "Please choose exactly one correct answer."
            );
            return;
        }


        /*
         * Authentication check is only needed when
         * creating/updating through protected admin UI.
         */

        if (authLoading) {
            alert(
                "Authentication is still loading. Please wait a moment and try again."
            );
            return;
        }

        if (!session?.user) {
            alert(
                "No active session found. Please log in again."
            );
            return;
        }


        setLoading(true);

        try {

            if (editingQuestion) {

                await updateQuestion();

                setSuccessMessage(
                    "Question updated successfully!"
                );

            } else {

                await createQuestion();

                setSuccessMessage(
                    "Question created successfully!"
                );
            }


            /*
             * Refresh first so the UI reflects exactly
             * what is now in Supabase.
             */

            await refreshQuestions();


            /*
             * Reset after successful save.
             */

            resetForm();

            if (editingQuestion) {
                setEditingQuestion(null);
            }


            setTimeout(() => {
                setSuccessMessage("");
            }, 4000);

        } catch (error) {

            console.error(
                "Question save error:",
                error
            );

            alert(
                `Unable to save question:\n\n${
    error?.message ||
    "Unknown error"
}`
            );

        } finally {

            setLoading(false);
        }
    };


    /* ======================================================
       UI
    ====================================================== */

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 sm:p-8 space-y-8"
        >

            {/* ==================================================
                SUCCESS MESSAGE
            ================================================== */}

            {successMessage && (

                <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">

                    <div className="flex items-center gap-3">

                        <span className="text-xl">
                            ✓
                        </span>

                        <div>

                            <p className="font-semibold">
                                {successMessage}
                            </p>

                            <p className="text-sm text-green-600 mt-1">
                                The question and all four answers
                                have been saved.
                            </p>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="border-b border-gray-200 pb-6">

                <p className="text-xs uppercase tracking-[0.3em] text-purple-500 font-semibold mb-2">
                    {editingQuestion
                        ? "Edit Scripture Question"
                        : "Create Scripture Question"}
                </p>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">

                    {editingQuestion
                        ? "Edit Bible Question"
                        : "Create Bible Question"}

                </h2>

                <p className="text-gray-500 mt-2">

                    {editingQuestion
                        ? "Update the question, answers, and supporting Scripture information."
                        : "Build engaging Bible quiz questions for your congregation."}

                </p>

            </div>


            {/* ==================================================
                QUESTION
            ================================================== */}

            <div className="space-y-5">

                <div>

                    <label className="block mb-2 font-semibold text-gray-700">
                        Question *
                    </label>

                    <textarea
                        rows={4}
                        value={question}
                        onChange={(e) =>
                            setQuestion(e.target.value)
                        }
                        placeholder="Example: Who built the ark according to Genesis?"
                        className="w-full border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                    />

                </div>


                {/* ==================================================
                    REFERENCE / DIFFICULTY
                ================================================== */}

                <div className="grid md:grid-cols-2 gap-5">

                    <div>

                        <label className="block mb-2 font-semibold text-gray-700">
                            Bible Reference *
                        </label>

                        <input
                            value={bibleReference}
                            onChange={(e) =>
                                setBibleReference(
                                    e.target.value
                                )
                            }
                            placeholder="Genesis 6:14"
                            className="w-full border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />

                    </div>


                    <div>

                        <label className="block mb-2 font-semibold text-gray-700">
                            Difficulty
                        </label>

                        <select
                            value={difficulty}
                            onChange={(e) =>
                                setDifficulty(
                                    e.target.value
                                )
                            }
                            className="w-full border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                            <option value="Easy">
                                Easy
                            </option>

                            <option value="Medium">
                                Medium
                            </option>

                            <option value="Hard">
                                Hard
                            </option>
                        </select>

                    </div>

                </div>


                {/* ==================================================
                    POINTS / IMAGE
                ================================================== */}

                <div className="grid md:grid-cols-2 gap-5">

                    <div>

                        <label className="block mb-2 font-semibold text-gray-700">
                            Points
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={points}
                            onChange={(e) =>
                                setPoints(
                                    Number(e.target.value)
                                )
                            }
                            className="w-full border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />

                    </div>


                    <div>

                        <label className="block mb-2 font-semibold text-gray-700">
                            Image URL
                            <span className="font-normal text-gray-400">
                                {" "} (Optional)
                            </span>
                        </label>

                        <input
                            value={imageUrl}
                            onChange={(e) =>
                                setImageUrl(
                                    e.target.value
                                )
                            }
                            placeholder="https://..."
                            className="w-full border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />

                    </div>

                </div>


                {/* ==================================================
                    ANSWERS
                ================================================== */}

                <AnswerFields
                    answers={answers}
                    setAnswers={setAnswers}
                    correctAnswer={correctAnswer}
                    setCorrectAnswer={setCorrectAnswer}
                />


                {/* ==================================================
                    EXPLANATION
                ================================================== */}

                <div>

                    <label className="block mb-2 font-semibold text-gray-700">
                        Explanation
                        <span className="font-normal text-gray-400">
                            {" "} (Optional)
                        </span>
                    </label>

                    <textarea
                        rows={5}
                        value={explanation}
                        onChange={(e) =>
                            setExplanation(
                                e.target.value
                            )
                        }
                        placeholder="Explain why the correct answer is supported by Scripture..."
                        className="w-full border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                    />

                </div>

            </div>


            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="flex flex-col sm:flex-row gap-3">

                <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 px-8 py-4 rounded-2xl font-semibold text-white transition-all ${
    loading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-purple-600 hover:bg-purple-500"
}`}
                >
                    {loading
                        ? "Saving..."
                        : editingQuestion
                            ? "💾 Update Question"
                            : "➕ Save Question"}
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
                        className="sm:w-40 border border-gray-300 hover:bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-semibold transition"
                    >
                        Cancel
                    </button>

                )}

            </div>

        </form>
    );
}