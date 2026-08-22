import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function QuizForm({
                                     editingQuiz,
                                     setEditingQuiz,
                                     refreshQuizzes,
                                 }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [weekNumber, setWeekNumber] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!editingQuiz) {
            clearForm();
            return;
        }

        setTitle(editingQuiz.title || "");
        setDescription(editingQuiz.description || "");
        setWeekNumber(editingQuiz.week_number || "");
        setYear(editingQuiz.year || new Date().getFullYear());
        setStartDate(editingQuiz.start_date || "");
        setEndDate(editingQuiz.end_date || "");
        setIsActive(editingQuiz.is_active || false);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

    }, [editingQuiz]);

    function clearForm() {
        setEditingQuiz(null);

        setTitle("");
        setDescription("");
        setWeekNumber("");
        setYear(new Date().getFullYear());
        setStartDate("");
        setEndDate("");
        setIsActive(false);
    }

    async function saveQuiz() {
        if (!title || !startDate || !endDate) {
            alert("Please complete all required fields.");
            return;
        }

        setLoading(true);

        const payload = {
            title,
            description,
            week_number: weekNumber || null,
            year,
            start_date: startDate,
            end_date: endDate,
            is_active: isActive,
        };

        let error;

        if (editingQuiz) {
            ({ error } = await supabase
                .from("bible_quizzes")
                .update(payload)
                .eq("id", editingQuiz.id));
        } else {
            ({ error } = await supabase
                .from("bible_quizzes")
                .insert(payload));
        }

        setLoading(false);

        if (error) {
            alert(error.message);
            return;
        }

        clearForm();
        refreshQuizzes();
    }

    return (
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

            <div className="flex items-center justify-between mb-6">

                <div>

                    <h2 className="text-3xl font-bold">
                        {editingQuiz ? "Edit Bible Quiz" : "Create Bible Quiz"}
                    </h2>

                    <p className="text-gray-500 mt-1">
                        {editingQuiz
                            ? "Update the quiz information."
                            : "Create a new weekly Bible quiz."}
                    </p>

                </div>

                {editingQuiz && (
                    <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold">
                        Editing
                    </span>
                )}

            </div>

            <div className="grid gap-5">

                <input
                    className="border rounded-2xl p-4"
                    placeholder="Quiz Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    rows={4}
                    className="border rounded-2xl p-4"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="grid md:grid-cols-2 gap-4">

                    <input
                        type="number"
                        className="border rounded-2xl p-4"
                        placeholder="Week Number"
                        value={weekNumber}
                        onChange={(e) => setWeekNumber(e.target.value)}
                    />

                    <input
                        type="number"
                        className="border rounded-2xl p-4"
                        placeholder="Year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    />

                </div>

                <div className="grid md:grid-cols-2 gap-4">

                    <div>

                        <label className="block mb-2 text-sm text-gray-600">
                            Start Date
                        </label>

                        <input
                            type="date"
                            className="w-full border rounded-2xl p-4"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />

                    </div>

                    <div>

                        <label className="block mb-2 text-sm text-gray-600">
                            End Date
                        </label>

                        <input
                            type="date"
                            className="w-full border rounded-2xl p-4"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />

                    </div>

                </div>

                <label className="flex items-center gap-3">

                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />

                    <span>Active Quiz</span>

                </label>

                <div className="flex flex-wrap gap-4">

                    <button
                        onClick={saveQuiz}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-semibold"
                    >
                        {loading
                            ? "Saving..."
                            : editingQuiz
                                ? "Update Quiz"
                                : "Create Quiz"}
                    </button>

                    {editingQuiz && (

                        <button
                            onClick={clearForm}
                            className="border border-gray-300 hover:bg-gray-100 px-8 py-4 rounded-2xl font-semibold"
                        >
                            Cancel
                        </button>

                    )}

                </div>

            </div>

        </section>
    );
}