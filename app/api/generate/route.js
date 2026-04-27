import { generateQuizFromGemini } from "@/lib/gemini";

export const runtime = "nodejs";

const VALID_NB = [5, 10, 15];
const VALID_DIFF = ["Facile", "Moyen", "Difficile"];

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      source,
      sourceType,
      nbQuestions,
      difficulty,
      title,
    } = body ?? {};

    if (!source || typeof source !== "string" || source.trim().length === 0) {
      return Response.json({ error: "Source requise" }, { status: 400 });
    }
    if (sourceType !== "text" && sourceType !== "theme") {
      return Response.json({ error: "sourceType invalide" }, { status: 400 });
    }
    if (sourceType === "text" && source.trim().length < 50) {
      return Response.json(
        { error: "Texte trop court (minimum 50 caractères)" },
        { status: 400 }
      );
    }
    if (sourceType === "text" && source.length > 3000) {
      return Response.json(
        { error: "Texte trop long (maximum 3000 caractères)" },
        { status: 400 }
      );
    }
    const nb = Number(nbQuestions);
    if (!VALID_NB.includes(nb)) {
      return Response.json(
        { error: "Nombre de questions invalide" },
        { status: 400 }
      );
    }
    if (!VALID_DIFF.includes(difficulty)) {
      return Response.json({ error: "Difficulté invalide" }, { status: 400 });
    }

if (!process.env.OPENROUTER_API_KEY) {
  return Response.json(
    { error: "Clé API manquante sur le serveur" },
    { status: 500 }
  );
}

    const parsed = await generateQuizFromGemini({
      source: source.trim(),
      sourceType,
      nbQuestions: nb,
      difficulty,
      title: title?.trim() || null,
    });

    return Response.json({
      title: parsed.title,
      questions: parsed.questions,
    });
  } catch (err) {
    console.error("generate error", err);
    return Response.json(
      { error: "La génération a échoué, réessayez." },
      { status: 500 }
    );
  }
}
