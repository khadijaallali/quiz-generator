"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { signInWithGoogle, signOutUser } from "@/lib/auth";

export default function AuthButton({ onSignedIn }) {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSignIn() {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
      if (onSignedIn) onSignedIn();
    } catch (e) {
      setError("Connexion impossible");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    try {
      await signOutUser();
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <button
        disabled
        className="rounded-full bg-zinc-200 px-4 py-2 text-sm text-zinc-500"
      >
        ...
      </button>
    );
  }

  if (user) {
    return (
      <button
        onClick={handleSignOut}
        disabled={busy}
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50"
      >
        Déconnexion
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSignIn}
        disabled={busy}
        className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        <GoogleIcon />
        {busy ? "Connexion..." : "Se connecter avec Google"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#fff"
        d="M21.6 12.2c0-.7-.1-1.3-.2-2H12v3.8h5.4c-.2 1.2-.9 2.2-2 2.9v2.4h3.2c1.9-1.7 3-4.3 3-7.1z"
      />
      <path
        fill="#fff"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.4c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.5C4.7 19.8 8.1 22 12 22z"
      />
      <path
        fill="#fff"
        d="M6.4 14.1c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.6H3.1C2.4 9 2 10.5 2 12s.4 3 1.1 4.4l3.3-2.3z"
      />
      <path
        fill="#fff"
        d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 3.2 14.7 2 12 2 8.1 2 4.7 4.2 3.1 7.6l3.3 2.5c.8-2.3 3-4 5.6-4z"
      />
    </svg>
  );
}
