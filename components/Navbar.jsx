"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import AuthButton from "./AuthButton";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const links = user
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/generate", label: "Créer un quiz" },
        { href: "/history", label: "Historique" },
      ]
    : [];

  return (
    <header className="sticky top-0 z-20 w-full border-b border-zinc-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            Q
          </span>
          <span>QuizAI</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-zinc-700 transition hover:text-indigo-600"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                {user.photoURL && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "user"}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="hidden text-sm text-zinc-600 lg:inline">
                  {user.displayName?.split(" ")[0]}
                </span>
              </div>
            )}
            {!loading && <AuthButton />}
          </div>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden rounded p-2 text-zinc-700 hover:bg-zinc-100"
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-zinc-200 bg-white md:hidden">
          <div className="flex flex-col gap-3 px-4 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-zinc-700"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2">{!loading && <AuthButton />}</div>
          </div>
        </div>
      )}
    </header>
  );
}
