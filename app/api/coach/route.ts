import { NextRequest, NextResponse } from "next/server";
import { generateJSON, generateText } from "@/lib/gemini";
import { validateCoach, type TemplateType } from "@/lib/validation";

const TEMPLATE_PROMPTS: Record<TemplateType, string> = {
  RTI: "Generate a Right to Information (RTI) application under the RTI Act 2005 for an Indian citizen.",
  Complaint: "Generate a formal complaint letter to a government department.",
  Appeal: "Generate an appeal letter against a rejected government application.",
  Reminder: "Generate a reminder letter for a pending complaint that has not been resolved.",
  Escalation: "Generate an escalation letter to a senior officer when the complaint is ignored.",
};

const OFFICER_SYSTEM_PROMPT =
  "You are a strict but fair municipal officer in India. The citizen is filing a complaint. Ask realistic clarifying questions one at a time. After 3 exchanges, give brief feedback on how well the citizen communicated. Keep responses under 3 sentences.";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateCoach(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  const { mode, text, templateType, history } = validation.data;

  try {
    if (mode === "roleplay") {
      const contents = [
        { role: "user" as const, parts: [{ text: `${OFFICER_SYSTEM_PROMPT}\n\nCitizen says: ${text}` }] },
        ...(history as { role: "user" | "model"; parts: { text: string }[] }[] ?? []),
      ];
      const reply = await generateText(contents);
      return NextResponse.json({ reply });
    }

    // mode === "template"
    const basePrompt = TEMPLATE_PROMPTS[templateType as TemplateType];
    const prompt = `${basePrompt} The issue is: "${text}". Return JSON: { "template": "full letter text", "instructions": ["instruction1","instruction2","instruction3"] }`;
    const json = await generateJSON(prompt);
    return NextResponse.json(json);
  } catch (err) {
    console.error("[/api/coach]", err);
    return NextResponse.json(
      { error: "Coach request failed. Please try again." },
      { status: 502 }
    );
  }
}
