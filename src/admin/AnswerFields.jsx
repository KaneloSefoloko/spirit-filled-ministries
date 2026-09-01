import { CheckCircle2 } from "lucide-react";

const ANSWER_LETTERS = ["A", "B", "C", "D"];

export default function AnswerFields({
    answers,
    setAnswers,
    correctAnswer,
    setCorrectAnswer,
}) {
    /* ======================================================
       UPDATE ANSWER
    ====================================================== */

    const updateAnswer = (letter, value) => {
        setAnswers((previous) =>
            previous.map((item) =>
                item.option_letter === letter
                    ? {
                        ...item,
                        answer: value,
                    }
                    : item
            )
        );
    };


    /* ======================================================
       ANSWER COUNT
    ====================================================== */

    const completedAnswers = ANSWER_LETTERS.filter(
        (letter) => {
            const answer = answers.find(
                (item) =>
                    item.option_letter === letter
            );

            return answer?.answer?.trim();
        }
    ).length;


    /* ======================================================
       UI
    ====================================================== */

    return (
        <div className="space-y-6">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">

                <div>

                    <p className="text-xs uppercase tracking-[0.25em] text-purple-500 font-semibold mb-2">
                        Multiple Choice
                    </p>

                    <h3 className="text-xl font-bold text-gray-900">
                        Answer Options
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                        Enter four possible answers and select the
                        correct one.
                    </p>

                </div>


                {/* ANSWER COUNT */}

                <div
                    className={`self-start sm:self-auto px-3 py-1.5 rounded-full text-xs font-semibold 
                    ${completedAnswers === 4 
                        ? "bg-green-100 text-green-700" 
                        : "bg-orange-100 text-orange-700"
                    }`}
                >
                    {completedAnswers}/4 completed
                </div>

            </div>


            {/* ==================================================
                ANSWER OPTIONS
            ================================================== */}

            <div className="grid gap-4">

                {ANSWER_LETTERS.map((letter) => {

                    const answer = answers.find(
                        (item) =>
                            item.option_letter === letter
                    );

                    const isCorrect =
                        correctAnswer === letter;

                    const hasText =
                        Boolean(answer?.answer?.trim());

                    return (
                        <div
                            key={letter}
                            className={`rounded-2xl border p-4 transition-all 
                            ${isCorrect 
                                ? "border-green-300 bg-green-50" 
                                : "border-gray-200 bg-gray-50"
                            }`}
                        >

                            <div className="flex items-center justify-between gap-3 mb-3">

                                <label
                                    htmlFor={`answer-${letter}`}
                                    className="flex items-center gap-3 font-semibold text-gray-800"
                                >

                                    <span
                                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0 
                                        ${isCorrect 
                                            ? "bg-green-600 text-white" 
                                            : "bg-gray-200 text-gray-700"
                                        }`}
                                    >
                                        {letter}
                                    </span>

                                    <span>
                                        Answer {letter}
                                    </span>

                                </label>


                                {isCorrect && (
                                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">

                                        <CheckCircle2 className="w-4 h-4" />

                                        Correct

                                    </span>
                                )}

                            </div>


                            <input
                                id={`answer-${letter}`}
                                type="text"
                                value={answer?.answer ?? ""}
                                onChange={(e) =>
                                    updateAnswer(
                                        letter,
                                        e.target.value
                                    )
                                }
                                className={`w-full bg-white border rounded-xl p-4 outline-none transition ${
                                    isCorrect 
                                        ? "border-green-300 focus:ring-2 focus:ring-green-500" 
                                        : "border-gray-200 focus:ring-2 focus:ring-purple-500"
                                }`}
                                placeholder={`Enter Answer ${letter}`}
                            />

                        </div>
                    );
                })}

            </div>


            {/* ==================================================
                CORRECT ANSWER
            ================================================== */}

            <div className="rounded-2xl border border-green-200 bg-green-50 p-5">

                <div className="flex items-start gap-3">

                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />

                    <div className="flex-1">

                        <label
                            htmlFor="correct-answer"
                            className="block font-semibold text-green-800 mb-2"
                        >
                            Correct Answer
                        </label>

                        <p className="text-sm text-green-700 mb-3">
                            Choose which answer should be marked
                            correct when the participant submits the quiz.
                        </p>


                        <select
                            id="correct-answer"
                            value={correctAnswer}
                            onChange={(e) =>
                                setCorrectAnswer(
                                    e.target.value
                                )
                            }
                            className="w-full bg-white border border-green-200 rounded-xl p-4 text-gray-800 font-medium focus:ring-2 focus:ring-green-500 focus:outline-none"
                        >

                            {ANSWER_LETTERS.map((letter) => (

                                <option
                                    key={letter}
                                    value={letter}
                                >
                                    Answer {letter}
                                </option>

                            ))}

                        </select>

                    </div>

                </div>

            </div>


            {/* ==================================================
                HELPER MESSAGE
            ================================================== */}

            {completedAnswers < 4 && (

                <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3">

                    <p className="text-sm text-orange-700">
                        Please complete all four answer options
                        before saving this question.
                    </p>

                </div>

            )}

        </div>
    );
}