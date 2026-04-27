export const runtime = "nodejs";

// The scores collection is written client-side via Firestore (see lib/firestore.js)
// to keep Firebase Auth identity with the request and honor the security rules.
// This endpoint is kept as a thin wrapper for future use (e.g. server-side validation).
export async function POST(request) {
  try {
    const body = await request.json();
    const { score, total } = body ?? {};
    if (
      typeof score !== "number" ||
      typeof total !== "number" ||
      total <= 0
    ) {
      return Response.json({ error: "Paramètres invalides" }, { status: 400 });
    }
    const percentage = Math.round((score / total) * 100);
    return Response.json({ percentage });
  } catch (err) {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
