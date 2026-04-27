"use client";

export default function QuestionBlock({
  question,
  index,
  total,
  selectedIndex,
  onSelect,
  revealed,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          Question {index + 1} / {total}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-zinc-900">{question.question}</h2>

      <ul className="flex flex-col gap-2">
        {question.options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect = revealed && i === question.correctIndex;
          const isWrong = revealed && isSelected && i !== question.correctIndex;

          let cls =
            "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ";
          if (isCorrect) cls += "border-green-500 bg-green-50 text-green-900";
          else if (isWrong) cls += "border-red-500 bg-red-50 text-red-900";
          else if (isSelected) cls += "border-indigo-500 bg-indigo-50 text-indigo-900";
          else cls += "border-zinc-200 bg-white text-zinc-800 hover:border-indigo-300";

          return (
            <li key={i}>
              <button
                type="button"
                disabled={revealed}
                onClick={() => onSelect(i)}
                className={cls + " w-full"}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-xs font-semibold">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {revealed && (
        <div className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700">
          <p className="font-medium text-zinc-900">
            {selectedIndex === question.correctIndex
              ? "Bonne réponse !"
              : `Mauvaise réponse. La bonne réponse est : ${String.fromCharCode(
                  65 + question.correctIndex
                )}.`}
          </p>
          {question.explanation && (
            <p className="mt-1 text-zinc-600">{question.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}
