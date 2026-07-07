// lib/gemini.ts
// Singleton Gemini client with centralised error handling.

import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const MODEL = "gemini-2.5-flash";

/** Call Gemini and parse the JSON response. Throws on API or parse failure. */
export async function generateJSON<T>(prompt: string): Promise<T> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response.");
  }

  return JSON.parse(response.text) as T;
}

/** Call Gemini for plain text (roleplay). */
export async function generateText(
  contents: Parameters<typeof ai.models.generateContent>[0]["contents"]
): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response.");
  }

  return response.text;
}
