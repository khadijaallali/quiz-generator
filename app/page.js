"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import AuthButton from "@/components/AuthButton";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  return (
    <div>
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          Powered by Open Router
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Créez des quiz intelligents en un clic.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
          QuizAI transforme un texte ou un simple thème en un QCM
          pédagogique complet. Révisez, apprenez, partagez — depuis n&apos;importe où.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center sm:flex-row">
          {user ? (
            <Link
              href="/generate"
              className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Commencer
            </Link>
          ) : (
            <AuthButton onSignedIn={() => router.replace("/dashboard")} />
          )}
          <Link
            href="#features"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            En savoir plus
          </Link>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-5xl px-4 pt-2 pb-12">
        <div className="grid sm:grid-cols-3">
          <Feature
            title="Génération instantanée"
            desc="Collez un texte ou entrez un thème : l'IA rédige 5 à 15 questions QCM en quelques secondes."
          />
          <Feature

            title="Cloud & multi-appareils"
            desc="Vos quiz et scores sont sauvegardés dans Firestore et accessibles partout."
          />
          <Feature

            title="Suivi des progrès"
            desc="Historique complet, graphique d'évolution et explications pour chaque réponse."
          />
        </div>
      </section>
    </div>
  );
}

function Feature({ emoji, title, desc }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="text-3xl">{emoji}</div>
      <h3 className="mt-3 font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 text-sm text-zinc-600">{desc}</p>
    </div>
  );
}
