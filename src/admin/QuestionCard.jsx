import {
    CheckCircle2,
    Copy,
    FileText,
    Image as ImageIcon,
    Pencil,
    Trash2,
} from "lucide-react";

export default function QuestionCard({
    question,
    onEdit,
    onDuplicate,
    onDelete,
    deleting = false,
}) {
    const difficultyColors = {
        Easy: "bg-green-100 text-green-700",
        Medium: "bg-yellow-100 text-yellow-700",
        Hard: "bg-red-100 text-red-700",
    };

    const sortedAnswers = [
        ...(question.bible_quiz_answers || []),
    ].sort(
        (a, b) =>
            (a.display_order ?? 0) -
            (b.display_order ?? 0)
    );

    const correctAnswer = sortedAnswers.find(
        (answer) => answer.is_correct
    );

    const hasAllAnswers = sortedAnswers.length === 4;

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="p-6 border-b border-gray-200">

                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">

                    {/* QUESTION */}

                    <div className="flex items-start gap-4 min-w-0">

                        <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                            <FileText className="w-7 h-7 text-purple-600" />
                        </div>

                        <div className="min-w-0">

                            <div className="flex items-center gap-3 flex-wrap">

                                <h3 className="text-xl font-bold text-gray-900">
                                    Question {question.order_number ?? "-"}
                                </h3>

                                {!hasAllAnswers && (
                                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                        {sortedAnswers.length}/4 Answers
                                    </span>
                                )}

                            </div>

                            <p className="text-gray-700 mt-3 text-lg leading-relaxed break-words">
                                {question.question}
                            </p>

                        </div>

                    </div>


                    {/* QUESTION META */}

                    <div className="flex flex-wrap gap-2 xl:justify-end">

                        {question.bible_reference && (
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                {question.bible_reference}
                            </span>
                        )}

                        <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
    difficultyColors[question.difficulty] ??
    "bg-gray-100 text-gray-700"
}`}
                        >
                            {question.difficulty || "Easy"}
                        </span>

                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                            ⭐ {question.points ?? 1} Point
                            {(question.points ?? 1) > 1 ? "s" : ""}
                        </span>

                    </div>

                </div>

            </div>


            {/* =====================================================
                ANSWERS
            ====================================================== */}

            <div className="p-6">

                <div className="flex items-center justify-between gap-4 mb-4">

                    <h4 className="font-bold text-gray-900">
                        Answer Options
                    </h4>

                    {correctAnswer && (
                        <span className="text-sm text-green-600 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            Correct answer: {correctAnswer.option_letter}
                        </span>
                    )}

                </div>


                {/* ANSWERS */}

                {sortedAnswers.length > 0 ? (

                    <div className="grid gap-3">

                        {sortedAnswers.map((answer, index) => {

                            const optionLetter =
                                answer.option_letter ||
                                String.fromCharCode(65 + index);

                            const answerText =
                                answer.answer?.trim();

                            return (
                                <div
                                    key={
                                        answer.id ||
                                        `${question.id}-${optionLetter}`
                                    }
                                    className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition ${
    answer.is_correct
        ? "border-green-300 bg-green-50"
        : "border-gray-200 bg-gray-50"
}`}
                                >

                                    <div className="flex items-start gap-3 min-w-0">

                                        <div
                                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0 ${
    answer.is_correct
        ? "bg-green-600 text-white"
        : "bg-gray-300 text-gray-700"
}`}
                                        >
                                            {optionLetter}
                                        </div>

                                        <span
                                            className={`font-medium break-words ${
    answerText
        ? "text-gray-800"
        : "text-red-500 italic"
}`}
                                        >
                                            {answerText ||
                                                "Answer text is missing"}
                                        </span>

                                    </div>

                                    {answer.is_correct && (
                                        <span className="text-green-600 font-semibold text-sm flex items-center gap-1 shrink-0">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Correct
                                        </span>
                                    )}

                                </div>
                            );
                        })}

                    </div>

                ) : (

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

                        <p className="font-semibold text-red-700">
                            No answer options found.
                        </p>

                        <p className="text-sm text-red-600 mt-1">
                            Edit this question and add all four answer options
                            before making the quiz available to users.
                        </p>

                    </div>

                )}


                {/* =================================================
                    VALIDATION WARNING
                ================================================= */}

                {sortedAnswers.length > 0 && !hasAllAnswers && (

                    <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4">

                        <p className="font-semibold text-orange-700">
                            ⚠️ This question is incomplete.
                        </p>

                        <p className="text-sm text-orange-600 mt-1">
                            A complete Bible quiz question should contain
                            exactly four answer options.
                        </p>

                    </div>

                )}

                {!correctAnswer && sortedAnswers.length > 0 && (

                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">

                        <p className="font-semibold text-red-700">
                            ⚠️ No correct answer is selected.
                        </p>

                        <p className="text-sm text-red-600 mt-1">
                            Edit this question and select the correct answer
                            before publishing the quiz.
                        </p>

                    </div>

                )}


                {/* =================================================
                    EXPLANATION
                ================================================= */}

                {question.explanation && (

                    <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-5">

                        <h4 className="font-semibold text-amber-700 mb-2">
                            Explanation
                        </h4>

                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {question.explanation}
                        </p>

                    </div>

                )}


                {/* =================================================
                    IMAGE
                ================================================= */}

                {question.image_url && (

                    <div className="mt-6">

                        <div className="flex items-center gap-2 mb-3">

                            <ImageIcon className="w-4 h-4 text-gray-500" />

                            <span className="text-sm font-semibold text-gray-600">
                                Question Image
                            </span>

                        </div>

                        <img
                            src={question.image_url}
                            alt={`Question ${question.order_number ?? ""}`}
                            className="w-full max-w-2xl max-h-80 object-cover rounded-2xl border border-gray-200"
                        />

                    </div>

                )}

            </div>


            {/* =====================================================
                FOOTER
            ====================================================== */}

            <div className="border-t border-gray-200 bg-gray-50 p-5">

                <div className="flex flex-col sm:flex-row gap-3">

                    {/* EDIT */}

                    <button
                        type="button"
                        onClick={onEdit}
                        className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-400 text-white px-5 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                    >
                        <Pencil className="w-5 h-5" />
                        Edit
                    </button>


                    {/* DUPLICATE */}

                    <button
                        type="button"
                        onClick={onDuplicate}
                        className="flex-1 sm:flex-none bg-sky-600 hover:bg-sky-500 text-white px-5 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                    >
                        <Copy className="w-5 h-5" />
                        Duplicate
                    </button>


                    {/* DELETE */}

                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={deleting}
                        className={`flex-1 sm:flex-none px-5 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
    deleting
        ? "bg-gray-400 text-white cursor-not-allowed"
        : "bg-red-600 hover:bg-red-500 text-white"
}`}
                    >
                        <Trash2 className="w-5 h-5" />

                        {deleting
                            ? "Deleting..."
                            : "Delete"}
                    </button>

                </div>

            </div>

        </div>
    );
}