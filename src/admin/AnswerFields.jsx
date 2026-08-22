export default function AnswerFields({
                                         answers,
                                         setAnswers,
                                         correctAnswer,
                                         setCorrectAnswer,
                                     }) {
    function updateAnswer(letter, value) {
        setAnswers((prev) => ({
            ...prev,
            [letter]: value,
        }));
    }

    return (
        <div className="space-y-6">

            <h3 className="text-xl font-bold">
                Answer Options
            </h3>

            <div className="grid gap-4">

                {["A", "B", "C", "D"].map((letter) => (

                    <div key={letter}>

                        <label className="block mb-2 font-medium">
                            Answer {letter}
                        </label>

                        <input
                            type="text"
                            value={answers[letter]}
                            onChange={(e) =>
                                updateAnswer(letter, e.target.value)
                            }
                            className="w-full border rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder={`Enter Answer ${letter}`}
                        />

                    </div>

                ))}

            </div>

            <div>

                <label className="block mb-2 font-medium">
                    Correct Answer
                </label>

                <select
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="w-full border rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                    <option value="A">Answer A</option>
                    <option value="B">Answer B</option>
                    <option value="C">Answer C</option>
                    <option value="D">Answer D</option>
                </select>

            </div>

        </div>
    );
}