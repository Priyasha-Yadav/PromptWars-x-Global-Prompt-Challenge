import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const { text, location, category } = await req.json();

  const prompt = `You are a civic complaint transformation engine for Indian citizens.

Raw complaint: "${text}"
Location: "${location}"
Category: "${category}"

Return ONLY valid JSON matching this EXACT schema (no extra keys):
{
  "summary": "one-line summary",
  "professional": "formal complaint letter (2-3 paragraphs)",
  "emotional": "citizen appeal conveying human impact (2-3 paragraphs)",
  "legal": "legal notice style citing relevant Indian acts/rights (2-3 paragraphs)",
  "department": "exact government department responsible",
  "escalation": ["Level 1: ...", "Level 2: ...", "Level 3: ..."],
  "evidence": ["evidence item 1", "evidence item 2", "evidence item 3", "evidence item 4"],
  "priority": "Low|Medium|High|Critical",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "score": 0,
  "scoreFeedback": "brief explanation of the score",
  "improvements": ["suggestion 1", "suggestion 2", "suggestion 3"],

  "impact": {
    "resolutionLikelihood": "Low|Medium|High",
    "likelihoodReason": "one sentence reason based on issue type and public safety",
    "expectedTimeline": "e.g. 30–45 days",
    "timelineCategory": "Urgent|1 week|1 month|3 months",
    "similarComplaints": [
      { "category": "string", "issue": "string", "resolvedIn": "string", "department": "string", "resolution": "string" },
      { "category": "string", "issue": "string", "resolvedIn": "string", "department": "string", "resolution": "string" },
      { "category": "string", "issue": "string", "resolvedIn": "string", "department": "string", "resolution": "string" }
    ],
    "successStory": {
      "problem": "string",
      "action": "string",
      "outcome": "string"
    }
  },

  "collective": {
    "clusterKeywords": ["keyword1", "keyword2"],
    "severityScore": 7
  }
}

Scoring rules:
- score out of 100: specificity (30pts), clarity (25pts), actionability (25pts), evidence mentioned (20pts)
- impact.similarComplaints: 3 real-pattern civic complaints from India similar to this one
- impact.successStory: ONE hypothetical illustrative example of a similar issue resolved — clearly fictional
- collective.severityScore: integer 1–10 based on public impact`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  const json = JSON.parse(response.text!);
  return NextResponse.json(json);
}
