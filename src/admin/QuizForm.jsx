import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const emptyForm = {
    title: "",
    description: "",
    week_number: "",
    year: new Date().getFullYear(),
    start_date: "",
    end_date: "",
    is_active: false,
};

export default function QuizForm({
                                     editingQuiz,
                                     setEditingQuiz,
                                     refreshQuizzes,
                                 }) {
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    /* ======================================================
       LOAD EDITING QUIZ
    ====================================================== */

    useEffect(() => {
        if (!editingQuiz) {
            setForm(emptyForm);
            return;
        }

        setForm({
            title: editingQuiz.title || "",
            description: editingQuiz.description || "",
            week_number: editingQuiz.week_number ?? "",
            year: editingQuiz.year ?? new Date().getFullYear(),
            start_date: editingQuiz.start_date || "",
            end_date: editingQuiz.end_date || "",
            is_active: editingQuiz.is_active ?? false,
        });
    }, [editingQuiz]);

    /* ======================================================
       INPUT CHANGE
    ====================================================== */

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    /* ======================================================
       RESET FORM
    ====================================================== */

    const resetForm = () => {
        setForm(emptyForm);
        setEditingQuiz(null);
    };

    /* ======================================================
       SAVE QUIZ
    ====================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            alert("Please enter a quiz title.");
            return;
        }

        if (!form.start_date) {
            alert("Please select a start date.");
            return;
        }

        if (!form.end_date) {
            alert("Please select an end date.");
            return;
        }

        if (form.end_date < form.start_date) {
            alert("End date cannot be before the start date.");
            return;
        }

        setSaving(true);

        try {
            const quizData = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                week_number: form.week_number
                    ? Number(form.week_number)
                    : null,
                year: form.year
                    ? Number(form.year)
                    : new Date().getFullYear(),
                start_date: form.start_date,
                end_date: form.end_date,
                is_active: form.is_active,
            };

            /* ==================================================
               UPDATE EXISTING QUIZ
            ================================================== */

            if (editingQuiz) {
                const { error } = await supabase
                    .from("bible_quizzes")
                    .update(quizData)
                    .eq("id", editingQuiz.id);

                if (error) {
                    throw error;
                }

                alert("✅ Quiz updated successfully.");
            }

            /* ==================================================
               CREATE NEW QUIZ
            ================================================== */

            else {
                const { error } = await supabase
                    .from("bible_quizzes")
                    .insert(quizData);

                if (error) {
                    throw error;
                }

                alert("✅ Quiz created successfully.");
            }

            resetForm();

            await refreshQuizzes();
        } catch (error) {
            console.error("Quiz save error:", error);

            alert(
                error?.message ||
                "Something went wrong while saving the quiz."
            );
        } finally {
            setSaving(false);
        }
    };

    /* ======================================================
       UI
    ====================================================== */

    return (
        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">

            {/* HEADER */}

            <div className="mb-8">

                <p className="text-xs uppercase tracking-[0.3em] text-purple-500 font-semibold mb-2">
                    {editingQuiz
                        ? "Edit Scripture Challenge"
                        : "Create Scripture Challenge"}
                </p>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {editingQuiz
                        ? "Edit Bible Quiz"
                        : "Create New Bible Quiz"}
                </h2>

                <p className="text-gray-500 mt-2">
                    {editingQuiz
                        ? "Update the details of this Bible quiz."
                        : "Set up a weekly Bible quiz before adding questions."}
                </p>

            </div>

            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >

                {/* TITLE */}

                <div>

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quiz Title
                    </label>

                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Bible Quiz — Week 1"
                        className="w-full border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />

                </div>

                {/* DESCRIPTION */}

                <div>

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                    </label>

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Describe this week's Bible challenge..."
                        className="w-full border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />

                </div>

                {/* WEEK / YEAR */}

                <div className="grid sm:grid-cols-2 gap-5">

                    <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Week Number
                        </label>

                        <input
                            type="number"
                            name="week_number"
                            min="1"
                            max="53"
                            value={form.week_number}
                            onChange={handleChange}
                            placeholder="e.g. 1"
                            className="w-full border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />

                    </div>

                    <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Year
                        </label>

                        <input
                            type="number"
                            name="year"
                            min="2020"
                            max="2100"
                            value={form.year}
                            onChange={handleChange}
                            className="w-full border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />

                    </div>

                </div>

                {/* DATES */}

                <div className="grid sm:grid-cols-2 gap-5">

                    <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Start Date
                        </label>

                        <input
                            type="date"
                            name="start_date"
                            value={form.start_date}
                            onChange={handleChange}
                            className="w-full border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />

                    </div>

                    <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            End Date
                        </label>

                        <input
                            type="date"
                            name="end_date"
                            value={form.end_date}
                            onChange={handleChange}
                            className="w-full border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />

                    </div>

                </div>

                {/* ACTIVE */}

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

                    <label className="flex items-start gap-4 cursor-pointer">

                        <input
                            type="checkbox"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                            className="mt-1 w-5 h-5 accent-purple-600"
                        />

                        <div>

                            <p className="font-semibold text-gray-900">
                                Make this quiz active
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                Active quizzes can be used as the current
                                Bible challenge on the website.
                            </p>

                        </div>

                    </label>

                </div>

                {/* ACTIONS */}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-300 text-white rounded-2xl py-4 font-semibold transition"
                    >
                        {saving
                            ? "Saving..."
                            : editingQuiz
                                ? "💾 Save Changes"
                                : "➕ Create Quiz"}
                    </button>

                    {editingQuiz && (
                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={saving}
                            className="sm:w-40 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-2xl py-4 font-semibold transition"
                        >
                            Cancel
                        </button>
                    )}

                </div>

            </form>

        </section>
    );
}