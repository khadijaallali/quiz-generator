function buildPrompt({ source, sourceType, nbQuestions, difficulty, title }) {
  const subjectLine =
    sourceType === "text"
      ? `Base-toi sur le texte suivant pour créer les questions :\n"""${source}"""`
      : `Le sujet du quiz est : "${source}".`;

  const titleLine = title
    ? `Le titre du quiz est imposé : "${title}".`
    : `Invente un titre court et pertinent pour le quiz.`;

  return `Tu es un générateur de quiz éducatifs.
${subjectLine}
${titleLine}
Génère exactement ${nbQuestions} questions QCM en français.
Difficulté : ${difficulty}.
Chaque question doit avoir EXACTEMENT 4 options, une seule bonne réponse, et une explication pédagogique.

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans texte avant ou après) au format :
{
  "title": "Titre du quiz",
  "questions": [
    {
      "id": "q1",
      "question": "Énoncé de la question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Explication de la bonne réponse"
    }
  ]
}`;
}

function extractJson(raw) {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("JSON introuvable");
  return JSON.parse(cleaned.slice(first, last + 1));
}

const FREE_MODELS = [
  "openrouter/free", // auto-picks any available free model
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "google/gemma-3-12b-it:free",
  "nvidia/llama-3.1-nemotron-nano-8b-v1:free",
];

export async function generateQuizFromGemini(params) {
  if (!process.env.OPENROUTER_API_KEY)
    throw new Error("OPENROUTER_API_KEY manquante");

  const prompt = buildPrompt(params);
  let lastErr = null;

  for (const model of FREE_MODELS) {
    try {
      console.log(`[openrouter] trying model: ${model}`);
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Quiz Generator",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2048,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const status = res.status;
        console.warn(`[openrouter] model ${model} failed:`, status, err);
        lastErr = Object.assign(new Error(err?.error?.message || "API error"), {
          status,
        });
        continue;
      }

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content;
      if (!raw) throw new Error("Réponse vide du modèle");

      const parsed = extractJson(raw);
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("Format invalide : questions manquantes");
      }

      parsed.questions = parsed.questions.map((q, i) => ({
        id: q.id || `q${i + 1}`,
        question: String(q.question || "").trim(),
        options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
        correctIndex: Number.isInteger(q.correctIndex) ? q.correctIndex : 0,
        explanation: String(q.explanation || "").trim(),
      }));

      console.log(`[openrouter] success with model: ${model}`);
      return parsed;
    } catch (err) {
      lastErr = err;
      if (err?.status === 429 || err?.status === 503) continue;
      throw err;
    }
  }

  throw lastErr || new Error("Tous les modèles ont échoué");
}
