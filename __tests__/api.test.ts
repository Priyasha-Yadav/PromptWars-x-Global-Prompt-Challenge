// __tests__/api.test.ts
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;
type GetHandler = () => Promise<NextResponse>;

// ── Mock the shared Gemini client ─────────────────────────────────────────────
vi.mock("../lib/gemini", () => ({
  generateJSON: vi.fn(),
  generateText: vi.fn(),
}));

import { generateJSON, generateText } from "../lib/gemini";

const mockGenerateJSON = vi.mocked(generateJSON);
const mockGenerateText = vi.mocked(generateText);

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── /api/generate ─────────────────────────────────────────────────────────────

describe("POST /api/generate", () => {
  let POST: RouteHandler;
  beforeAll(async () => { ({ POST } = await import("../app/api/generate/route")); });
  beforeEach(() => vi.clearAllMocks());

  const validBody = {
    text: "There is a large pothole on the main road that has been there for 3 months.",
    location: "MG Road, Bengaluru",
    category: "Roads",
  };

  const mockResult = {
    summary: "Pothole on MG Road",
    professional: "Dear Sir/Madam...",
    emotional: "As a resident...",
    legal: "Under the Municipal Act...",
    department: "BBMP",
    escalation: ["Level 1: Ward Officer"],
    evidence: ["Photos"],
    priority: "High",
    keywords: ["pothole", "road"],
    score: 72,
    scoreFeedback: "Good specificity",
    improvements: ["Add date"],
    impact: {
      resolutionLikelihood: "High",
      likelihoodReason: "Public safety issue",
      expectedTimeline: "30-45 days",
      timelineCategory: "1 month",
      similarComplaints: [],
      successStory: { problem: "p", action: "a", outcome: "o" },
    },
    collective: { clusterKeywords: ["pothole"], severityScore: 7 },
  };

  it("returns 200 with valid input", async () => {
    mockGenerateJSON.mockResolvedValueOnce(mockResult);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.summary).toBe("Pothole on MG Road");
  });

  it("returns 400 for malformed JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json{{{",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 422 when text is too short", async () => {
    const res = await POST(makeRequest({ ...validBody, text: "short" }));
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toMatch(/text/i);
  });

  it("returns 422 when location is missing", async () => {
    const res = await POST(makeRequest({ ...validBody, location: "" }));
    expect(res.status).toBe(422);
  });

  it("returns 422 when category is missing", async () => {
    const res = await POST(makeRequest({ ...validBody, category: "" }));
    expect(res.status).toBe(422);
  });

  it("returns 502 when Gemini throws", async () => {
    mockGenerateJSON.mockRejectedValueOnce(new Error("API quota exceeded"));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it("does not leak internal error details in 502 response", async () => {
    mockGenerateJSON.mockRejectedValueOnce(new Error("secret internal error with key abc123"));
    const res = await POST(makeRequest(validBody));
    const data = await res.json();
    expect(JSON.stringify(data)).not.toContain("abc123");
  });
});

// ── /api/translate ────────────────────────────────────────────────────────────

describe("POST /api/translate", () => {
  let POST: RouteHandler;
  beforeAll(async () => { ({ POST } = await import("../app/api/translate/route")); });
  beforeEach(() => vi.clearAllMocks());

  const validBody = {
    mode: "citizen_to_official",
    text: "The road near my house has a big pothole that nobody is fixing.",
  };

  it("returns 200 for citizen_to_official", async () => {
    mockGenerateJSON.mockResolvedValueOnce({ result: "Formal version", toneAnalysis: { original: "Informal", improved: "Formal", tips: [] } });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
  });

  it("returns 200 for all valid modes", async () => {
    const modes = ["citizen_to_official", "official_to_citizen", "jargon", "tone_check"];
    for (const mode of modes) {
      mockGenerateJSON.mockResolvedValueOnce({ result: "ok" });
      const res = await POST(makeRequest({ ...validBody, mode }));
      expect(res.status).toBe(200);
    }
  });

  it("returns 422 for invalid mode", async () => {
    const res = await POST(makeRequest({ ...validBody, mode: "hack_mode" }));
    expect(res.status).toBe(422);
  });

  it("returns 422 for text too short", async () => {
    const res = await POST(makeRequest({ ...validBody, text: "hi" }));
    expect(res.status).toBe(422);
  });

  it("returns 502 when Gemini throws", async () => {
    mockGenerateJSON.mockRejectedValueOnce(new Error("network error"));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
  });
});

// ── /api/coach ────────────────────────────────────────────────────────────────

describe("POST /api/coach", () => {
  let POST: RouteHandler;
  beforeAll(async () => { ({ POST } = await import("../app/api/coach/route")); });
  beforeEach(() => vi.clearAllMocks());

  const validRoleplay = {
    mode: "roleplay",
    text: "There is a broken streetlight on my street for two months.",
  };

  const validTemplate = {
    mode: "template",
    text: "There is a broken streetlight on my street for two months.",
    templateType: "RTI",
  };

  it("returns 200 for roleplay mode", async () => {
    mockGenerateText.mockResolvedValueOnce("What is the exact location?");
    const res = await POST(makeRequest(validRoleplay));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toBeTruthy();
  });

  it("returns 200 for template mode", async () => {
    mockGenerateJSON.mockResolvedValueOnce({ template: "Dear Sir...", instructions: ["Step 1"] });
    const res = await POST(makeRequest(validTemplate));
    expect(res.status).toBe(200);
  });

  it("returns 422 for template mode without templateType", async () => {
    const res = await POST(makeRequest({ mode: "template", text: validTemplate.text }));
    expect(res.status).toBe(422);
  });

  it("returns 422 for invalid mode", async () => {
    const res = await POST(makeRequest({ ...validRoleplay, mode: "unknown" }));
    expect(res.status).toBe(422);
  });

  it("returns 502 when Gemini throws in roleplay", async () => {
    mockGenerateText.mockRejectedValueOnce(new Error("timeout"));
    const res = await POST(makeRequest(validRoleplay));
    expect(res.status).toBe(502);
  });

  it("returns 502 when Gemini throws in template", async () => {
    mockGenerateJSON.mockRejectedValueOnce(new Error("timeout"));
    const res = await POST(makeRequest(validTemplate));
    expect(res.status).toBe(502);
  });
});

// ── /api/petition ─────────────────────────────────────────────────────────────

describe("POST /api/petition", () => {
  let POST: RouteHandler;
  beforeAll(async () => { ({ POST } = await import("../app/api/petition/route")); });
  beforeEach(() => vi.clearAllMocks());

  const validBody = {
    complaints: [
      "The road near our colony has potholes for 3 months.",
      "Multiple accidents have occurred due to the bad road condition.",
    ],
    location: "Sector 14, Gurugram",
    category: "Roads",
  };

  it("returns 200 with valid input", async () => {
    mockGenerateJSON.mockResolvedValueOnce({
      petition: "We the residents...",
      title: "Road Repair Petition",
      demands: ["Fix potholes"],
    });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe("Road Repair Petition");
  });

  it("returns 422 for empty complaints array", async () => {
    const res = await POST(makeRequest({ ...validBody, complaints: [] }));
    expect(res.status).toBe(422);
  });

  it("returns 422 for missing location", async () => {
    const res = await POST(makeRequest({ ...validBody, location: "" }));
    expect(res.status).toBe(422);
  });

  it("returns 502 when Gemini throws", async () => {
    mockGenerateJSON.mockRejectedValueOnce(new Error("rate limit"));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
  });
});

// ── /api/health ───────────────────────────────────────────────────────────────

describe("GET /api/health", () => {
  let GET: GetHandler;
  beforeAll(async () => { ({ GET } = await import("../app/api/health/route")); });

  it("returns 200 with status ok", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
  });

  it("response content-type is json", async () => {
    const res = await GET();
    expect(res.headers.get("content-type")).toMatch(/json/);
  });
});

// ── sanitize quote injection (regression) ─────────────────────────────────────

describe("sanitize — prompt injection chars", () => {
  it("is imported from validation", async () => {
    const { sanitize } = await import("../lib/validation");
    expect(sanitize('say "hello"')).toBe("say 'hello'");
    expect(sanitize("path\\to\\file")).toBe("pathtofile");
  });
});

// ── /api/generate — sanitized input reaches Gemini ───────────────────────────

describe("POST /api/generate — injection sanitization", () => {
  let POST: RouteHandler;
  beforeAll(async () => { ({ POST } = await import("../app/api/generate/route")); });
  beforeEach(() => vi.clearAllMocks());

  it("strips HTML from inputs before calling Gemini", async () => {
    mockGenerateJSON.mockResolvedValueOnce({ summary: "ok" });
    await POST(makeRequest({
      text: "<script>alert(1)</script> pothole on road near my house for months now",
      location: "<b>MG Road</b>, Bengaluru",
      category: "Roads",
    }));
    const calledPrompt = mockGenerateJSON.mock.calls[0][0] as string;
    expect(calledPrompt).not.toContain("<script>");
    expect(calledPrompt).not.toContain("<b>");
  });

  it("returns 422 for null body", async () => {
    const req = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(null),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
