"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { getQuiz, createScore } from "@/lib/firestore";
import QuestionBlock from "@/components/QuestionBlock";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function QuizPage({ params }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(true);
  const [error, setError] = useState(null);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> selectedIndex
  const [revealed, setRevealed] = useState({}); // questionId -> bool
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const q = await getQuiz(id);
        if (cancelled) return;
        if (!q) setError("Quiz introuvable");
        else setQuiz(q);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Impossible de charger le quiz.");
      } finally {
        if (!cancelled) setQuizLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (loading) return;
    if (quizLoading) return;
    if (!quiz) return;
    if (!user && !quiz.isPublic) {
      router.replace("/");
    }
  }, [loading, quizLoading, quiz, user, router]);

  const totalQ = quiz?.questions?.length ?? 0;
  const q = quiz?.questions?.[current];

  const score = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.reduce((acc, qq) => {
      return answers[qq.id] === qq.correctIndex ? acc + 1 : acc;
    }, 0);
  }, [quiz, answers]);

  function handleSelect(i) {
    if (!q) return;
    if (revealed[q.id]) return;
    setAnswers((a) => ({ ...a, [q.id]: i }));
    setRevealed((r) => ({ ...r, [q.id]: true }));
  }

  async function handleFinish() {
    if (!quiz) return;
    if (!user) {
      router.push("/");
      return;
    }
    setSubmitting(true);
    try {
      const userAnswers = quiz.questions.map((qq) => {
        const selected = answers[qq.id];
        const selectedIndex = typeof selected === "number" ? selected : -1;
        return {
          questionId: qq.id,
          selectedIndex,
          isCorrect: selectedIndex === qq.correctIndex,
        };
      });

      const total = quiz.questions.length;
      const percentage = Math.round((score / total) * 100);

      const scoreId = await createScore({
        uid: user.uid,
        quizId: quiz.id,
        quizTitle: quiz.title,
        score,
        total,
        percentage,
        answers: userAnswers,
      });

      router.push(`/results/${scoreId}`);
    } catch (e) {
      console.error(e);
      setError("Impossible d'enregistrer le score.");
      setSubmitting(false);
    }
  }

  if (loading || quizLoading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }
  if (!quiz) return null;

  const isLast = current === totalQ - 1;
  const progress = Math.round(((current + 1) / totalQ) * 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold text-zinc-900">{quiz.title}</h1>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>
            Question {current + 1} / {totalQ}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6">
        <QuestionBlock
          question={q}
          index={current}
          total={totalQ}
          selectedIndex={answers[q.id]}
          onSelect={handleSelect}
          revealed={!!revealed[q.id]}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
        >
          ← Précédent
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={handleFinish}
            disabled={submitting || !revealed[q.id]}
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Enregistrement..." : "Voir mes résultats"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.min(totalQ - 1, c + 1))}
            disabled={!revealed[q.id]}
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Question suivante →
          </button>
        )}
      </div>

      {!user && quiz.isPublic && (
        <p className="mt-6 text-center text-xs text-zinc-500">
          Mode invité — votre score ne sera pas sauvegardé.
        </p>
      )}
    </div>
  );
}
