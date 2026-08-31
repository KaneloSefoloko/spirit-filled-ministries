export default function AnswerFields({
                                         answers,
                                         setAnswers,
                                         correctAnswer,
                                         setCorrectAnswer,
                                     }) {
    function updateAnswer(letter, value) {
        setAnswers((prev) =>
            prev.map((item) =>
                item.option_letter === letter
                    ? {
                        ...item,
                        answer: value,
                    }
                    : item
            )
        );
    }

    return (
        <div className="space-y-6">

            <div>
                <h3 className="text-xl font-bold">
                    Answer Options
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                    Enter four possible answers and select the correct one.
                </p>
            </div>

            <div className="grid gap-4">

                {["A", "B", "C", "D"].map((letter) => {
                    const answer = answers.find(
                        (item) => item.option_letter === letter
                    );

                    return (
                        <div key={letter}>

                            <label className="block mb-2 font-medium">
                                Answer {letter}
                            </label>

                            <input
                                type="text"
                                value={answer?.answer ?? ""}
                                onChange={(e) =>
                                    updateAnswer(
                                        letter,
                                        e.target.value
                                    )
                                }
                                className="w-full border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                placeholder={`Enter Answer ${letter}`}
                            />

                        </div>
                    );
                })}

            </div>

            <div>

                <label className="block mb-2 font-medium">
                    Correct Answer
                </label>

                <select
                    value={correctAnswer}
                    onChange={(e) =>
                        setCorrectAnswer(e.target.value)
                    }
                    className="w-full border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                    <option value="A">
                        Answer A
                    </option>

                    <option value="B">
                        Answer B
                    </option>

                    <option value="C">
                        Answer C
                    </option>

                    <option value="D">
                        Answer D
                    </option>
                </select>

            </div>

        </div>
    );
}