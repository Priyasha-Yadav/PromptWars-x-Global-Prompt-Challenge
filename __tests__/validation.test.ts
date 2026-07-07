// __tests__/validation.test.ts
import { describe, it, expect } from "vitest";
import {
  sanitize,
  validateGenerate,
  validateTranslate,
  validateCoach,
  validatePetition,
  LIMITS,
} from "../lib/validation";

// ── sanitize ──────────────────────────────────────────────────────────────────

describe("sanitize", () => {
  it("returns empty string for non-string input", () => {
    expect(sanitize(null)).toBe("");
    expect(sanitize(undefined)).toBe("");
    expect(sanitize(42)).toBe("");
    expect(sanitize({})).toBe("");
  });

  it("trims whitespace", () => {
    expect(sanitize("  hello  ")).toBe("hello");
  });

  it("strips HTML tags", () => {
    expect(sanitize("<script>alert(1)</script>")).toBe("alert(1)");
    expect(sanitize("<b>bold</b>")).toBe("bold");
    expect(sanitize("<img src=x onerror=alert(1)>")).toBe("");
  });

  it("strips null bytes", () => {
    expect(sanitize("hello\0world")).toBe("helloworld");
  });

  it("neutralises double-quote injection", () => {
    expect(sanitize('say "hello"')).toBe("say 'hello'");
  });

  it("strips backslashes", () => {
    expect(sanitize("path\\to\\file")).toBe("pathtofile");
  });

  it("preserves normal civic complaint text", () => {
    const text = "The road near MG Road has a pothole since 3 months.";
    expect(sanitize(text)).toBe(text);
  });
});

// ── validateGenerate ──────────────────────────────────────────────────────────

describe("validateGenerate", () => {
  const valid = {
    text: "There is a large pothole on the main road that has been there for 3 months.",
    location: "MG Road, Bengaluru",
    category: "Roads",
  };

  it("accepts valid input", () => {
    const result = validateGenerate(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.text).toBe(valid.text);
      expect(result.data.location).toBe(valid.location);
      expect(result.data.category).toBe(valid.category);
    }
  });

  it("rejects non-object body", () => {
    const result = validateGenerate("string");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  it("rejects null body", () => {
    const result = validateGenerate(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  it("rejects text that is too short", () => {
    const result = validateGenerate({ ...valid, text: "short" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(422);
  });

  it("rejects text that exceeds max length", () => {
    const result = validateGenerate({ ...valid, text: "a".repeat(LIMITS.text.max + 1) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(422);
  });

  it("rejects empty location", () => {
    const result = validateGenerate({ ...valid, location: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(422);
  });

  it("rejects empty category", () => {
    const result = validateGenerate({ ...valid, category: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(422);
  });

  it("sanitizes HTML in text field", () => {
    const result = validateGenerate({ ...valid, text: "<b>pothole</b> on the road near my house for months now" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.text).not.toContain("<b>");
  });

  it("sanitizes HTML in location field", () => {
    const result = validateGenerate({ ...valid, location: "<script>MG Road</script>" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.location).not.toContain("<script>");
  });
});

// ── validateTranslate ─────────────────────────────────────────────────────────

describe("validateTranslate", () => {
  const valid = {
    mode: "citizen_to_official" as const,
    text: "The road near my house has a big pothole that nobody is fixing.",
  };

  it("accepts all valid modes", () => {
    const modes = ["citizen_to_official", "official_to_citizen", "jargon", "tone_check"] as const;
    for (const mode of modes) {
      const result = validateTranslate({ ...valid, mode });
      expect(result.ok).toBe(true);
    }
  });

  it("rejects unknown mode", () => {
    const result = validateTranslate({ ...valid, mode: "unknown_mode" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(422);
  });

  it("rejects missing mode", () => {
    const result = validateTranslate({ text: valid.text });
    expect(result.ok).toBe(false);
  });

  it("rejects text too short", () => {
    const result = validateTranslate({ ...valid, text: "hi" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(422);
  });

  it("rejects text too long", () => {
    const result = validateTranslate({ ...valid, text: "x".repeat(LIMITS.text.max + 1) });
    expect(result.ok).toBe(false);
  });

  it("sanitizes text", () => {
    const result = validateTranslate({ ...valid, text: "<script>alert(1)</script> pothole on road near my house" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.text).not.toContain("<script>");
  });
});

// ── validateCoach ─────────────────────────────────────────────────────────────

describe("validateCoach", () => {
  const validRoleplay = {
    mode: "roleplay" as const,
    text: "There is a broken streetlight on my street for two months.",
  };

  const validTemplate = {
    mode: "template" as const,
    text: "There is a broken streetlight on my street for two months.",
    templateType: "RTI" as const,
  };

  it("accepts valid roleplay input", () => {
    const result = validateCoach(validRoleplay);
    expect(result.ok).toBe(true);
  });

  it("accepts valid template input with all template types", () => {
    const types = ["RTI", "Complaint", "Appeal", "Reminder", "Escalation"] as const;
    for (const templateType of types) {
      const result = validateCoach({ ...validTemplate, templateType });
      expect(result.ok).toBe(true);
    }
  });

  it("rejects template mode without templateType", () => {
    const result = validateCoach({ mode: "template", text: validTemplate.text });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(422);
  });

  it("rejects invalid templateType", () => {
    const result = validateCoach({ ...validTemplate, templateType: "Invoice" });
    expect(result.ok).toBe(false);
  });

  it("rejects invalid mode", () => {
    const result = validateCoach({ ...validRoleplay, mode: "chat" });
    expect(result.ok).toBe(false);
  });

  it("caps history array at 20 items", () => {
    const history = Array.from({ length: 30 }, (_, i) => ({ role: "user", parts: [{ text: `msg ${i}` }] }));
    const result = validateCoach({ ...validRoleplay, history });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.history!.length).toBe(20);
  });

  it("defaults history to empty array when missing", () => {
    const result = validateCoach(validRoleplay);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.history).toEqual([]);
  });
});

// ── validatePetition ──────────────────────────────────────────────────────────

describe("validatePetition", () => {
  const valid = {
    complaints: [
      "The road near our colony has potholes for 3 months.",
      "Multiple accidents have occurred due to the bad road condition.",
    ],
    location: "Sector 14, Gurugram",
    category: "Roads",
  };

  it("accepts valid input", () => {
    const result = validatePetition(valid);
    expect(result.ok).toBe(true);
  });

  it("rejects empty complaints array", () => {
    const result = validatePetition({ ...valid, complaints: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(422);
  });

  it("rejects non-array complaints", () => {
    const result = validatePetition({ ...valid, complaints: "not an array" });
    expect(result.ok).toBe(false);
  });

  it(`rejects more than ${LIMITS.complaints.maxItems} complaints`, () => {
    const tooMany = Array.from({ length: LIMITS.complaints.maxItems + 1 }, (_, i) => `Complaint ${i} about road issues in the area.`);
    const result = validatePetition({ ...valid, complaints: tooMany });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(422);
  });

  it("filters out empty complaint strings after sanitization", () => {
    const result = validatePetition({ ...valid, complaints: ["<script></script>", "   ", valid.complaints[0]] });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.complaints).toHaveLength(1);
  });

  it("rejects when all complaints are empty after sanitization", () => {
    const result = validatePetition({ ...valid, complaints: ["<b></b>", "  "] });
    expect(result.ok).toBe(false);
  });

  it("rejects empty location", () => {
    const result = validatePetition({ ...valid, location: "" });
    expect(result.ok).toBe(false);
  });

  it("sanitizes HTML in complaints", () => {
    const result = validatePetition({
      ...valid,
      complaints: ["<img onerror=alert(1)> The road has potholes near our colony for months."],
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.complaints[0]).not.toContain("<img");
  });
});
