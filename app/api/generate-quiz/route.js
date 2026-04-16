import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || text.trim() === "") {
      return Response.json(
        { error: "Texte vide" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Tu es un assistant pédagogique. 
      À partir du texte suivant, génère exactement 5 questions QCM en français.
      Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après.
      Format attendu :
      {
        "questions": [
          {
            "question": "...",
            "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
            "answer": "A"
          }
        ]
      }
      Texte : ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return Response.json(parsed);

  } catch (error) {
    return Response.json(
      { error: "Erreur lors de la génération" },
      { status: 500 }
    );
  }
}