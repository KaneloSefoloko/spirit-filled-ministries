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

    const sortedAnswers = [...(question.bible_quiz_answers || [])].sort(
        (a, b) => a.option_letter.localeCompare(b.option_letter)
    );

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">

            {/* Header */}

            <div className="p-6 border-b">

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                    <div className="flex items-start gap-4">

                        <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl">
                            📖
                        </div>

                        <div>

                            <h3 className="text-xl font-bold text-gray-900">
                                Question {question.order_number}
                            </h3>

                            <p className="text-gray-700 mt-3 text-lg leading-relaxed">
                                {question.question}
                            </p>

                        </div>

                    </div>

                    <div className="flex flex-wrap gap-2">

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
                            {question.difficulty}
                        </span>

                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                            ⭐ {question.points} Point
                            {question.points > 1 ? "s" : ""}
                        </span>

                    </div>

                </div>

            </div>

            {/* Answers */}

            <div className="p-6">

                <div className="grid gap-3">

                    {sortedAnswers.map((answer) => (

                        <div
                            key={answer.id}
                            className={`rounded-2xl border p-4 flex items-center justify-between transition ${
                                answer.is_correct
                                    ? "border-green-300 bg-green-50"
                                    : "border-gray-200 bg-gray-50"
                            }`}
                        >

                            <div className="flex items-center gap-3">

                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                        answer.is_correct
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-300 text-gray-700"
                                    }`}
                                >
                                    {answer.option_letter}
                                </div>

                                <span className="font-medium">
                                    {answer.answer}
                                </span>

                            </div>

                            {answer.is_correct && (
                                <span className="text-green-600 font-semibold text-sm">
                                    ✓ Correct
                                </span>
                            )}

                        </div>

                    ))}

                </div>

                {question.explanation && (

                    <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-5">

                        <h4 className="font-semibold text-amber-700 mb-2">
                            Explanation
                        </h4>

                        <p className="text-gray-700 leading-relaxed">
                            {question.explanation}
                        </p>

                    </div>

                )}

                {question.image_url && (

                    <div className="mt-6">

                        <img
                            src={question.image_url}
                            alt="Question"
                            className="rounded-2xl border max-h-80 object-cover"
                        />

                    </div>

                )}

            </div>

            {/* Footer */}

            <div className="border-t bg-gray-50 p-5">

                <div className="flex flex-wrap gap-3">

                    <button
                        onClick={onEdit}
                        className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-3 rounded-xl font-semibold transition"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        onClick={onDuplicate}
                        className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-3 rounded-xl font-semibold transition"
                    >
                        📋 Duplicate
                    </button>

                    <button
                        onClick={onDelete}
                        disabled={deleting}
                        className={`px-5 py-3 rounded-xl font-semibold transition ${
                            deleting
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-500 text-white"
                        }`}
                    >
                        {deleting ? "⏳ Deleting..." : "🗑 Delete"}
                    </button>

                </div>

            </div>

        </div>
    );
}