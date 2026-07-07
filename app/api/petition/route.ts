import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const { complaints, location, category } = await req.json();

  const complaintList = complaints.map((c: string, i: number) => `Complaint ${i + 1}: ${c}`).join("\n");

  const prompt = `Generate a formal collective petition letter representing these citizen complaints about ${category} issues in ${location}.

${complaintList}

Return JSON:
{
  "petition": "full formal petition letter addressed to the Municipal Commissioner, written as 'We the residents of ${location}...', 3-4 paragraphs, professional tone",
  "title": "short petition title",
  "demands": ["demand1", "demand2", "demand3"]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  return NextResponse.json(JSON.parse(response.text!));
}
