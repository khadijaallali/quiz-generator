"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { createQuiz } from "@/lib/firestore";
import LoadingSpinner from "@/components/LoadingSpinner";

const NB_OPTIONS = [5, 10, 15];
const DIFFICULTIES = ["Facile", "Moyen", "Difficile"];

export default function GeneratePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState("text");
  const [source, setSource] = useState("");
  const [nb, setNb] = useState(5);
  const [difficulty, setDifficulty] = useState("Moyen");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const trimmed = source.trim();
    if (mode === "text" && trimmed.length < 50) {
      setError("Le texte doit faire au moins 50 caractères.");
      return;
    }
    if (mode === "theme" && trimmed.length < 3) {
      setError("Merci d'entrer un thème valide.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: trimmed,
          sourceType: mode,
          nbQuestions: nb,
          difficulty,
          title: title.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Échec de la génération");
      }

      const { title: generatedTitle, questions } = await res.json();

      const quizId = await createQuiz({
        uid: user.uid,
        title: generatedTitle || title.trim() || "Quiz",
        source: trimmed,
        sourceType: mode,
        questions,
        isPublic: false,
      });

      router.push(`/quiz/${quizId}`);
    } catch (e) {
      console.error(e);
      setError(e.message || "La génération a échoué, réessayez.");
      setBusy(false);
    }
  }

  if (loading || !user) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Générer un quiz</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Donnez un texte ou un thème, l&apos;IA fait le reste.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setMode("text")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === "text"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              À partir d&apos;un texte
            </button>
            <button
              type="button"
              onClick={() => setMode("theme")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === "theme"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              À partir d&apos;un thème
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            {mode === "text" ? "Votre texte" : "Thème / sujet"}
          </label>
          {mode === "text" ? (
            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              maxLength={3000}
              rows={8}
              placeholder="Collez ici un cours, un article..."
              className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              required
            />
          ) : (
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              type="text"
              placeholder="ex : La révolution française"
              className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              required
            />
          )}
          {mode === "text" && (
            <p className="mt-1 text-xs text-zinc-500">
              {source.length} / 3000 caractères
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-800">
              Nombre de questions
            </label>
            <div className="flex gap-2">
              {NB_OPTIONS.map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setNb(n)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                    nb === n
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-800">
              Difficulté
            </label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                    difficulty === d
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Titre (optionnel)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            placeholder="Laisser vide pour que l'IA propose un titre"
            className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              L&apos;IA génère votre quiz...
            </>
          ) : (
            "Générer le quiz"
          )}
        </button>
      </form>
    </div>
  );
}
