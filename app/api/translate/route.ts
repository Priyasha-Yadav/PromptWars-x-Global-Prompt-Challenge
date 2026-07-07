import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";
import { validateTranslate, type TranslateMode } from "@/lib/validation";

const PROMPTS: Record<TranslateMode, (text: string) => string> = {
  citizen_to_official: (text) =>
    `Rewrite this citizen complaint into professional government language. Maintain all facts. Improve clarity and formal tone. Return JSON: { "result": "...", "toneAnalysis": { "original": "Emotional|Aggressive|Vague|Informal", "improved": "Professional|Formal|Clear", "tips": ["tip1","tip2"] } }\n\nComplaint: "${text}"`,

  official_to_citizen: (text) =>
    `Explain this government notice to a citizen in simple language. Do not use legal jargon. Explain as if the reader is 15 years old. Return JSON: { "result": "...", "keyPoints": ["point1","point2","point3"], "followUpQuestions": ["question1","question2","question3","question4"] }\n\nNotice: "${text}"`,

  jargon: (text) =>
    `Explain the government and legal terms found in this text in simple everyday language for an Indian citizen. Return JSON: { "explanations": [{ "term": "...", "simple": "...", "example": "..." }] }\n\nText: "${text}"`,

  tone_check: (text) =>
    `Analyze the tone of this complaint and score it. Return JSON: { "tone": "Respectful|Aggressive|Emotional|Vague|Professional", "score": 0, "feedback": "...", "rewritten": "improved version", "suggestions": ["suggestion1","suggestion2"] }\n\nComplaint: "${text}"`,
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateTranslate(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  const { mode, text } = validation.data;

  try {
    const json = await generateJSON(PROMPTS[mode](text));
    return NextResponse.json(json);
  } catch (err) {
    console.error("[/api/translate]", err);
    return NextResponse.json(
      { error: "Translation failed. Please try again." },
      { status: 502 }
    );
  }
}
