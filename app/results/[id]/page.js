"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { getScore, getQuiz } from "@/lib/firestore";
import LoadingSpinner from "@/components/LoadingSpinner";

function barColor(p) {
  if (p >= 70) return "bg-green-500";
  if (p >= 50) return "bg-orange-500";
  return "bg-red-500";
}

function message(p) {
  if (p >= 90) return "Excellent ! Maîtrise complète 🎉";
  if (p >= 70) return "Très bien, vous maîtrisez le sujet.";
  if (p >= 50) return "Pas mal — encore un effort !";
  return "Il reste du chemin, ne lâchez rien.";
}

export default function ResultsPage({ params }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  const [score, setScore] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const s = await getScore(id);
        if (cancelled) return;
        if (!s) {
          setError("Résultat introuvable");
          return;
        }
        setScore(s);
        const q = await getQuiz(s.quizId);
        if (cancelled) return;
        setQuiz(q);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Impossible de charger les résultats.");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, id]);

  if (loading || !user || dataLoading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }
  if (!score) return null;

  const p = score.percentage;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">
        {quiz?.title || "Résultats"}
      </h1>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-zinc-600">Votre score</p>
        <p className="mt-1 text-4xl font-bold text-zinc-900">
          {score.score} / {score.total}
          <span className="ml-2 text-2xl text-zinc-500">({p}%)</span>
        </p>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-zinc-200">
          <div
            className={`h-full ${barColor(p)} transition-all`}
            style={{ width: `${p}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-zinc-700">{message(p)}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {quiz && (
          <Link
            href={`/quiz/${quiz.id}`}
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Refaire ce quiz
          </Link>
        )}
        <Link
          href="/generate"
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
        >
          Nouveau quiz
        </Link>
        <Link
          href="/history"
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
        >
          Mon historique
        </Link>
      </div>

      {quiz && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-900">
            Récapitulatif
          </h2>
          <ul className="mt-4 space-y-4">
            {quiz.questions.map((q, i) => {
              const a = score.answers.find((x) => x.questionId === q.id);
              const userIdx = a?.selectedIndex;
              const correct = q.correctIndex;
              return (
                <li
                  key={q.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-zinc-900">
                      {i + 1}. {q.question}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        a?.isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {a?.isCorrect ? "Correct" : "Faux"}
                    </span>
                  </div>
                  <div className="mt-3 text-sm">
                    <p className="text-zinc-600">
                      Votre réponse :{" "}
                      <span
                        className={
                          a?.isCorrect ? "text-green-700" : "text-red-700"
                        }
                      >
                        {typeof userIdx === "number" && userIdx >= 0
                          ? q.options[userIdx]
                          : "— (non répondu)"}
                      </span>
                    </p>
                    {!a?.isCorrect && (
                      <p className="text-zinc-700">
                        Bonne réponse :{" "}
                        <span className="font-medium text-green-700">
                          {q.options[correct]}
                        </span>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="mt-2 text-zinc-600">{q.explanation}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
