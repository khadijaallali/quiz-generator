import Link from "next/link";

function formatDate(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function QuizCard({ quiz }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 font-semibold text-zinc-900">
          {quiz.title || "Quiz sans titre"}
        </h3>
        <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {quiz.questions?.length ?? 0} Q
        </span>
      </div>

      <p className="text-xs text-zinc-500">{formatDate(quiz.createdAt)}</p>

      <Link
        href={`/quiz/${quiz.id}`}
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        Reprendre
      </Link>
    </div>
  );
}
