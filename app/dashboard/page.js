"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { getUserQuizzes, getLastUserScore } from "@/lib/firestore";
import QuizCard from "@/components/QuizCard";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [quizzes, setQuizzes] = useState([]);
  const [lastScore, setLastScore] = useState(null);
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
        const [qs, ls] = await Promise.all([
          getUserQuizzes(user.uid, 3),
          getLastUserScore(user.uid),
        ]);
        if (cancelled) return;
        setQuizzes(qs);
        setLastScore(ls);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Impossible de charger vos données.");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          {user.photoURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt={user.displayName || "user"}
              className="h-12 w-12 rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Bonjour {user.displayName?.split(" ")[0] || "👋"}
            </h1>
            <p className="text-sm text-zinc-600">{user.email}</p>
          </div>
        </div>
        <Link
          href="/generate"
          className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          + Créer un quiz
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Derniers quiz</h2>
          <Link
            href="/history"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Voir tout l&apos;historique →
          </Link>
        </div>

        {dataLoading ? (
          <LoadingSpinner />
        ) : quizzes.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600">
            Aucun quiz pour l&apos;instant.{" "}
            <Link href="/generate" className="text-indigo-600 hover:underline">
              Créez votre premier quiz
            </Link>
            .
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900">Dernier score</h2>
        {dataLoading ? (
          <LoadingSpinner />
        ) : lastScore ? (
          <Link
            href={`/results/${lastScore.id}`}
            className="mt-4 flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md"
          >
            <div>
              <p className="font-semibold text-zinc-900">
                {lastScore.score} / {lastScore.total} ({lastScore.percentage}%)
              </p>
              <p className="text-xs text-zinc-500">
                {lastScore.completedAt
                  ? new Date(lastScore.completedAt).toLocaleString("fr-FR")
                  : ""}
              </p>
            </div>
            <span className="text-sm font-medium text-indigo-600">
              Voir les détails →
            </span>
          </Link>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">
            Aucun quiz passé pour le moment.
          </p>
        )}
      </section>
    </div>
  );
}
