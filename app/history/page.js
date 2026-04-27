"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { getUserScores } from "@/lib/firestore";
import HistoryTable from "@/components/HistoryTable";
import ScoreChart from "@/components/ScoreChart";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [scores, setScores] = useState([]);
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
        const s = await getUserScores(user.uid);
        if (cancelled) return;
        setScores(s);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Impossible de charger l'historique.");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading || !user) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Mon historique</h1>
        <Link
          href="/generate"
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Nouveau quiz
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {dataLoading ? (
        <LoadingSpinner />
      ) : scores.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 p-8 text-center">
          <p className="text-zinc-600">
            Vous n&apos;avez pas encore passé de quiz.
          </p>
          <Link
            href="/generate"
            className="mt-4 inline-block rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Créer mon premier quiz
          </Link>
        </div>
      ) : (
        <>
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              Évolution des scores
            </h2>
            <ScoreChart scores={scores} />
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">
              Quiz passés
            </h2>
            <HistoryTable rows={scores} />
          </section>
        </>
      )}
    </div>
  );
}
