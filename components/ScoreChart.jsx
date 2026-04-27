"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ScoreChart({ scores }) {
  if (!scores || scores.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
        Pas assez de données pour afficher le graphique.
      </div>
    );
  }

  const data = [...scores]
    .sort((a, b) => {
      const da = a.completedAt instanceof Date ? a.completedAt : new Date(a.completedAt);
      const db = b.completedAt instanceof Date ? b.completedAt : new Date(b.completedAt);
      return da - db;
    })
    .map((s, i) => {
      const d =
        s.completedAt instanceof Date ? s.completedAt : new Date(s.completedAt);
      return {
        name: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        percentage: s.percentage,
        index: i + 1,
      };
    });

  return (
    <div className="h-64 w-full rounded-xl border border-zinc-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
