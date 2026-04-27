"use client";

import Link from "next/link";

function formatDate(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pctColor(p) {
  if (p >= 70) return "bg-green-100 text-green-800";
  if (p >= 50) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

export default function HistoryTable({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-600">
        Vous n&apos;avez pas encore passé de quiz.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-3">Titre</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">%</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-zinc-50">
              <td className="px-4 py-3 font-medium text-zinc-900">
                {r.quizTitle || "Quiz"}
              </td>
              <td className="px-4 py-3 text-zinc-600">{formatDate(r.completedAt)}</td>
              <td className="px-4 py-3 text-zinc-700">
                {r.score} / {r.total}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${pctColor(
                    r.percentage
                  )}`}
                >
                  {r.percentage}%
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/results/${r.id}`}
                    className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                  >
                    Revoir
                  </Link>
                  <Link
                    href={`/quiz/${r.quizId}`}
                    className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    Refaire
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
