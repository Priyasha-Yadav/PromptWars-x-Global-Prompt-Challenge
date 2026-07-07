# CivicDraft AI

> AI-powered civic complaint platform for Indian citizens — draft, translate, practice, and petition with Gemini 2.5 Flash.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  /          /draft        /translate        /coach          │
│  Hero       DraftWorkspace  TranslatorTool  ConfidenceCoach │
│             InputForm                                       │
│             ResultsView                                     │
│               ├── ImpactPredictor                           │
│               └── CollectiveAction                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ fetch (JSON)
┌──────────────────────▼──────────────────────────────────────┐
│                   Next.js API Routes                        │
│                                                             │
│  POST /api/generate    POST /api/translate                  │
│  POST /api/coach       POST /api/petition                   │
│  GET  /api/health                                           │
│                                                             │
│  lib/validation.ts  ──►  sanitize + validate all inputs     │
│  lib/gemini.ts      ──►  singleton client + error handling  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────────┐
│              Google Gemini 2.5 Flash API                    │
│         responseMimeType: "application/json"                │
└─────────────────────────────────────────────────────────────┘
```

### Data flow for a complaint

```
User types complaint
       │
       ▼
InputForm validates (client-side: length, required fields)
       │
       ▼
POST /api/generate
       │
       ├── lib/validation.ts  →  sanitize HTML, check lengths
       │
       ├── lib/gemini.ts      →  generateJSON(prompt)
       │
       └── Returns structured JSON:
             summary, professional, emotional, legal,
             department, escalation, evidence, priority,
             keywords, score, scoreFeedback, improvements,
             impact { resolutionLikelihood, similarComplaints, successStory },
             collective { clusterKeywords, severityScore }
       │
       ▼
ResultsView renders 3 tabs:
  Draft          →  before/after, tabbed drafts, score ring, escalation
  Impact         →  ImpactPredictor (likelihood, timeline, patterns)
  Collective     →  CollectiveAction (pressure score, petition generator)
```

---

## Features

| Feature | Route | Description |
|---|---|---|
| Civic Draft | `/draft` | Transform raw complaints into professional, emotional, and legal drafts |
| Impact Predictor | `/draft` → Impact tab | AI resolution likelihood, timeline, similar patterns, success story |
| Collective Action | `/draft` → Collective tab | Community pressure score, complaint clustering, petition generator |
| Gov Speak Translator | `/translate` | 4 modes: citizen↔official, jargon explainer, tone analyzer |
| Confidence Coach | `/coach` | Officer roleplay simulation + 5 letter template types |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| AI | Google Gemini 2.5 Flash (`@google/genai`) |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Testing | Vitest 4 + `@testing-library/react` |
| Fonts | Inter + Space Grotesk (Google Fonts) |

---

## Project Structure

```
promptwars/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   # Complaint transformation
│   │   ├── translate/route.ts  # Language translation
│   │   ├── coach/route.ts      # Roleplay + templates
│   │   ├── petition/route.ts   # Collective petition
│   │   └── health/route.ts     # Health check
│   ├── draft/page.tsx
│   ├── translate/page.tsx
│   ├── coach/page.tsx
│   ├── layout.tsx              # Root layout with SiteNav + Footer
│   ├── page.tsx                # Landing page
│   ├── not-found.tsx
│   └── globals.css
├── components/
│   ├── DraftWorkspace.tsx      # Draft page orchestrator
│   ├── InputForm.tsx           # Complaint input form
│   ├── ResultsView.tsx         # Tabbed results (Draft/Impact/Collective)
│   ├── ImpactPredictor.tsx     # Resolution likelihood + patterns
│   ├── CollectiveAction.tsx    # Pressure score + petition
│   ├── TranslatorTool.tsx      # 4-mode translator
│   ├── ConfidenceCoach.tsx     # Roleplay + letter templates
│   ├── Hero.tsx                # Landing hero section
│   ├── SiteNav.tsx             # Sticky navigation bar
│   └── Footer.tsx
├── lib/
│   ├── validation.ts           # Input sanitization + validation (tested)
│   └── gemini.ts               # Shared Gemini client singleton
├── __tests__/
│   ├── validation.test.ts      # 35 unit tests for lib/validation
│   └── api.test.ts             # 23 integration tests for all API routes
├── next.config.ts              # Security headers + bundle optimization
├── vitest.config.ts
└── .env.local
```

---

## Setup

### Prerequisites

- Node.js 18+
- A Google AI Studio API key ([get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
git clone https://github.com/Priyasha-Yadav/PromptWars-x-Global-Prompt-Challenge.git
cd PromptWars-x-Global-Prompt-Challenge
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
GEMINI_API_KEY=your_google_ai_api_key_here
```

> The app will throw a startup error if `GEMINI_API_KEY` is missing.

### Run

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Tests
npm test

# Tests with coverage
npm run test:coverage
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Reference

All routes accept and return `application/json`. All POST routes validate and sanitize input before calling Gemini.

### `POST /api/generate`

Transforms a raw complaint into structured civic narratives.

**Request**
```json
{
  "text": "string (10–2000 chars)",
  "location": "string (2–200 chars)",
  "category": "string (2–100 chars)"
}
```

**Response**
```json
{
  "summary": "string",
  "professional": "string",
  "emotional": "string",
  "legal": "string",
  "department": "string",
  "escalation": ["string"],
  "evidence": ["string"],
  "priority": "Low | Medium | High | Critical",
  "keywords": ["string"],
  "score": 0,
  "scoreFeedback": "string",
  "improvements": ["string"],
  "impact": {
    "resolutionLikelihood": "Low | Medium | High",
    "likelihoodReason": "string",
    "expectedTimeline": "string",
    "timelineCategory": "Urgent | 1 week | 1 month | 3 months",
    "similarComplaints": [{ "category": "string", "issue": "string", "resolvedIn": "string", "department": "string", "resolution": "string" }],
    "successStory": { "problem": "string", "action": "string", "outcome": "string" }
  },
  "collective": { "clusterKeywords": ["string"], "severityScore": 7 }
}
```

---

### `POST /api/translate`

Translates between citizen and official language.

**Request**
```json
{
  "mode": "citizen_to_official | official_to_citizen | jargon | tone_check",
  "text": "string (10–2000 chars)"
}
```

**Response** varies by mode:

| Mode | Response shape |
|---|---|
| `citizen_to_official` | `{ result, toneAnalysis: { original, improved, tips[] } }` |
| `official_to_citizen` | `{ result, keyPoints[], followUpQuestions[] }` |
| `jargon` | `{ explanations: [{ term, simple, example }] }` |
| `tone_check` | `{ tone, score, feedback, rewritten, suggestions[] }` |

---

### `POST /api/coach`

Officer roleplay simulation and letter template generation.

**Request (roleplay)**
```json
{
  "mode": "roleplay",
  "text": "string",
  "history": [{ "role": "user | model", "parts": [{ "text": "string" }] }]
}
```

**Request (template)**
```json
{
  "mode": "template",
  "text": "string",
  "templateType": "RTI | Complaint | Appeal | Reminder | Escalation"
}
```

**Response (roleplay):** `{ "reply": "string" }`

**Response (template):** `{ "template": "string", "instructions": ["string"] }`

---

### `POST /api/petition`

Generates a collective petition from multiple complaints.

**Request**
```json
{
  "complaints": ["string (max 10 items)"],
  "location": "string",
  "category": "string"
}
```

**Response**
```json
{
  "petition": "string",
  "title": "string",
  "demands": ["string"]
}
```

---

### `GET /api/health`

**Response:** `{ "status": "ok" }`

---

## Error Responses

All routes return consistent error shapes:

| Status | Meaning |
|---|---|
| `400` | Malformed JSON body |
| `422` | Validation failed (missing/invalid fields) — includes `error` message |
| `502` | Gemini API failure — generic message, no internal details leaked |

---

## Security

- **Input sanitization** — all user text is HTML-stripped and null-byte-cleaned before being interpolated into prompts (`lib/validation.ts`)
- **Length limits** — text (2000), location (200), category (100), complaints array (10 items)
- **Mode allowlisting** — translate mode and coach templateType are validated against explicit allowlists, preventing prompt injection via mode parameter
- **History capping** — roleplay history is capped at 20 messages to prevent context stuffing
- **Error isolation** — Gemini errors are caught and replaced with generic 502 messages; internal error details never reach the client
- **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, `CSP`, `Referrer-Policy`, `Permissions-Policy` set via `next.config.ts`
- **API key** — stored in `.env.local`, never exposed to the client bundle

---

## Testing

```bash
npm test              # run all tests once
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

**58 tests across 2 suites:**

| Suite | Tests | Coverage |
|---|---|---|
| `validation.test.ts` | 35 | `lib/validation.ts` — sanitize, all 4 validators |
| `api.test.ts` | 23 | All 5 API routes — happy path, validation errors, Gemini failures, error isolation |

---

## Community Pressure Score

The collective action pressure score uses a deterministic formula — no AI required:

```
score = min(100, round( reports × severity × ln(daysPending + 1) / 3 ))
```

Where:
- `reports` = number of similar complaints in localStorage
- `severity` = 1–10 integer from Gemini's `collective.severityScore`
- `daysPending` = days since the issue was first reported (demo: 42)

---

## Roadmap

- [ ] **Rate limiting** — per-IP request throttling on all API routes
- [ ] **Multi-language support** — Hindi, Tamil, Bengali, Marathi complaint input
- [ ] **PDF export** — download complaint letters as formatted PDFs
- [ ] **Email-ready output** — one-click mailto with pre-filled subject and body
- [ ] **Complaint tracking** — localStorage-based status tracker with timeline
- [ ] **Voice input** — Web Speech API for complaint dictation
- [ ] **OCR for notices** — upload a government notice image, extract and translate text
- [ ] **Location-aware departments** — map complaint location to actual ward/district offices
- [ ] **Government portal links** — direct links to relevant state/central portals per department
- [ ] **Analytics dashboard** — aggregate complaint trends by category and location

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Run tests before committing: `npm test`
4. Open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE)

---

## Author

Built for the **PromptWars × Global Prompt Challenge** — making civic communication accessible to every Indian citizen through AI.
