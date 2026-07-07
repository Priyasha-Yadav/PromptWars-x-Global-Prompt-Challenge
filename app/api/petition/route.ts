import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";
import { validatePetition } from "@/lib/validation";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validatePetition(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  const { complaints, location, category } = validation.data;

  const complaintList = complaints
    .map((c, i) => `Complaint ${i + 1}: ${c}`)
    .join("\n");

  const prompt = `Generate a formal collective petition letter representing these citizen complaints about ${category} issues in ${location}.

${complaintList}

Return JSON:
{
  "petition": "full formal petition letter addressed to the Municipal Commissioner, written as 'We the residents of ${location}...', 3-4 paragraphs, professional tone",
  "title": "short petition title",
  "demands": ["demand1", "demand2", "demand3"]
}`;

  try {
    const json = await generateJSON(prompt);
    return NextResponse.json(json);
  } catch (err) {
    console.error("[/api/petition]", err);
    return NextResponse.json(
      { error: "Petition generation failed. Please try again." },
      { status: 502 }
    );
  }
}
