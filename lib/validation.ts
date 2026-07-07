// lib/validation.ts
// Central input validation and sanitization for all API routes.

export const LIMITS = {
  text: { min: 10, max: 2000 },
  location: { min: 2, max: 200 },
  category: { min: 2, max: 100 },
  complaints: { maxItems: 10, maxItemLength: 2000 },
} as const;

export const VALID_TRANSLATE_MODES = [
  "citizen_to_official",
  "official_to_citizen",
  "jargon",
  "tone_check",
] as const;

export const VALID_COACH_MODES = ["roleplay", "template"] as const;

export const VALID_TEMPLATE_TYPES = [
  "RTI",
  "Complaint",
  "Appeal",
  "Reminder",
  "Escalation",
] as const;

export type TranslateMode = (typeof VALID_TRANSLATE_MODES)[number];
export type CoachMode = (typeof VALID_COACH_MODES)[number];
export type TemplateType = (typeof VALID_TEMPLATE_TYPES)[number];

// Strip HTML tags, null bytes, and prompt-injection characters.
export function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")   // strip HTML tags
    .replace(/\0/g, "")         // strip null bytes
    .replace(/["\\]/g, (c) => (c === '"' ? "'" : "")) // neutralise quote injection
    .trim();
}

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

// ── Generate ──────────────────────────────────────────────────────────────────

export interface GenerateInput {
  text: string;
  location: string;
  category: string;
}

export function validateGenerate(body: unknown): ValidationResult<GenerateInput> {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object.", status: 400 };
  }

  const { text, location, category } = body as Record<string, unknown>;

  const t = sanitize(text);
  const l = sanitize(location);
  const c = sanitize(category);

  if (t.length < LIMITS.text.min || t.length > LIMITS.text.max) {
    return {
      ok: false,
      error: `text must be between ${LIMITS.text.min} and ${LIMITS.text.max} characters.`,
      status: 422,
    };
  }

  if (l.length < LIMITS.location.min || l.length > LIMITS.location.max) {
    return {
      ok: false,
      error: `location must be between ${LIMITS.location.min} and ${LIMITS.location.max} characters.`,
      status: 422,
    };
  }

  if (c.length < LIMITS.category.min || c.length > LIMITS.category.max) {
    return {
      ok: false,
      error: `category must be between ${LIMITS.category.min} and ${LIMITS.category.max} characters.`,
      status: 422,
    };
  }

  return { ok: true, data: { text: t, location: l, category: c } };
}

// ── Translate ─────────────────────────────────────────────────────────────────

export interface TranslateInput {
  mode: TranslateMode;
  text: string;
}

export function validateTranslate(body: unknown): ValidationResult<TranslateInput> {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object.", status: 400 };
  }

  const { mode, text } = body as Record<string, unknown>;
  const t = sanitize(text);

  if (!VALID_TRANSLATE_MODES.includes(mode as TranslateMode)) {
    return {
      ok: false,
      error: `mode must be one of: ${VALID_TRANSLATE_MODES.join(", ")}.`,
      status: 422,
    };
  }

  if (t.length < LIMITS.text.min || t.length > LIMITS.text.max) {
    return {
      ok: false,
      error: `text must be between ${LIMITS.text.min} and ${LIMITS.text.max} characters.`,
      status: 422,
    };
  }

  return { ok: true, data: { mode: mode as TranslateMode, text: t } };
}

// ── Coach ─────────────────────────────────────────────────────────────────────

export interface CoachInput {
  mode: CoachMode;
  text: string;
  templateType?: TemplateType;
  history?: unknown[];
}

export function validateCoach(body: unknown): ValidationResult<CoachInput> {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object.", status: 400 };
  }

  const { mode, text, templateType, history } = body as Record<string, unknown>;
  const t = sanitize(text);

  if (!VALID_COACH_MODES.includes(mode as CoachMode)) {
    return {
      ok: false,
      error: `mode must be one of: ${VALID_COACH_MODES.join(", ")}.`,
      status: 422,
    };
  }

  if (t.length < LIMITS.text.min || t.length > LIMITS.text.max) {
    return {
      ok: false,
      error: `text must be between ${LIMITS.text.min} and ${LIMITS.text.max} characters.`,
      status: 422,
    };
  }

  if (mode === "template") {
    if (!VALID_TEMPLATE_TYPES.includes(templateType as TemplateType)) {
      return {
        ok: false,
        error: `templateType must be one of: ${VALID_TEMPLATE_TYPES.join(", ")}.`,
        status: 422,
      };
    }
  }

  const safeHistory = Array.isArray(history) ? history.slice(0, 20) : [];

  return {
    ok: true,
    data: {
      mode: mode as CoachMode,
      text: t,
      templateType: templateType as TemplateType | undefined,
      history: safeHistory,
    },
  };
}

// ── Petition ──────────────────────────────────────────────────────────────────

export interface PetitionInput {
  complaints: string[];
  location: string;
  category: string;
}

export function validatePetition(body: unknown): ValidationResult<PetitionInput> {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object.", status: 400 };
  }

  const { complaints, location, category } = body as Record<string, unknown>;

  if (!Array.isArray(complaints) || complaints.length === 0) {
    return { ok: false, error: "complaints must be a non-empty array.", status: 422 };
  }

  if (complaints.length > LIMITS.complaints.maxItems) {
    return {
      ok: false,
      error: `complaints array must not exceed ${LIMITS.complaints.maxItems} items.`,
      status: 422,
    };
  }

  const sanitizedComplaints = complaints.map((c) => sanitize(c)).filter((c) => c.length > 0);

  if (sanitizedComplaints.length === 0) {
    return { ok: false, error: "All complaint entries are empty after sanitization.", status: 422 };
  }

  const l = sanitize(location);
  const cat = sanitize(category);

  if (l.length < LIMITS.location.min || l.length > LIMITS.location.max) {
    return {
      ok: false,
      error: `location must be between ${LIMITS.location.min} and ${LIMITS.location.max} characters.`,
      status: 422,
    };
  }

  if (cat.length < LIMITS.category.min || cat.length > LIMITS.category.max) {
    return {
      ok: false,
      error: `category must be between ${LIMITS.category.min} and ${LIMITS.category.max} characters.`,
      status: 422,
    };
  }

  return { ok: true, data: { complaints: sanitizedComplaints, location: l, category: cat } };
}
