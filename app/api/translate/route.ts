import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const { mode, text } = await req.json();

  const prompts: Record<string, string> = {
    citizen_to_official: `Rewrite this citizen complaint into professional government language. Maintain all facts. Improve clarity and formal tone. Return JSON: { "result": "...", "toneAnalysis": { "original": "Emotional|Aggressive|Vague|Informal", "improved": "Professional|Formal|Clear", "tips": ["tip1","tip2"] } }\n\nComplaint: "${text}"`,

    official_to_citizen: `Explain this government notice to a citizen in simple language. Do not use legal jargon. Explain as if the reader is 15 years old. Return JSON: { "result": "...", "keyPoints": ["point1","point2","point3"], "followUpQuestions": ["question1","question2","question3","question4"] }\n\nNotice: "${text}"`,

    jargon: `Explain these government/legal terms in simple everyday language for an Indian citizen. Return JSON: { "explanations": [{ "term": "...", "simple": "...", "example": "..." }] }\n\nTerms to explain (extract from this text): "${text}"`,

    tone_check: `Analyze the tone of this complaint and score it. Return JSON: { "tone": "Respectful|Aggressive|Emotional|Vague|Professional", "score": 0, "feedback": "...", "rewritten": "improved version", "suggestions": ["suggestion1","suggestion2"] }\n\nComplaint: "${text}"`,
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompts[mode] || prompts.citizen_to_official,
    config: { responseMimeType: "application/json" },
  });

  return NextResponse.json(JSON.parse(response.text!));
}
