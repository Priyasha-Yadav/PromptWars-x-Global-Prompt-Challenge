import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const { mode, text, history, templateType } = await req.json();

  if (mode === "roleplay") {
    const systemPrompt = `You are a strict but fair municipal officer in India. The citizen is filing a complaint. Ask realistic clarifying questions one at a time. After 3 exchanges, give brief feedback on how well the citizen communicated. Keep responses under 3 sentences.`;
    const msgs = [
      { role: "user" as const, parts: [{ text: systemPrompt + "\n\nCitizen says: " + text }] },
      ...(history || []),
    ];
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: msgs,
    });
    return NextResponse.json({ reply: response.text });
  }

  if (mode === "template") {
    const templates: Record<string, string> = {
      RTI: "Generate a Right to Information (RTI) application under the RTI Act 2005 for an Indian citizen.",
      Complaint: "Generate a formal complaint letter to a government department.",
      Appeal: "Generate an appeal letter against a rejected government application.",
      Reminder: "Generate a reminder letter for a pending complaint that has not been resolved.",
      Escalation: "Generate an escalation letter to a senior officer when the complaint is ignored.",
    };
    const prompt = `${templates[templateType] || templates.Complaint} The issue is: "${text}". Return JSON: { "template": "full letter text", "instructions": ["instruction1","instruction2","instruction3"] }`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    return NextResponse.json(JSON.parse(response.text!));
  }

  return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
}
