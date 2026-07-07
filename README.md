# CivicDraft AI – AI Civic Complaint Assistant

CivicDraft AI is an AI-powered civic assistance platform that helps Indian citizens draft, improve, and understand government complaints. Instead of struggling with formal language, legal terminology, or identifying the correct department, users can describe their issue in plain language and receive professional, actionable documents powered by Google's Gemini AI.

The project was built using **Next.js 16**, **React 19**, **TypeScript**, and **Gemini 2.5 Flash**.

---

## Features

### AI Complaint Generator
Transform a raw complaint into multiple professionally written formats:

- Professional government complaint
- Citizen appeal
- Legal-style notice
- Complaint summary
- Priority assessment
- Required evidence checklist
- Suggested government department
- Escalation path
- Improvement suggestions
- Resolution likelihood prediction

---

### Government Language Translator

Convert between different communication styles:

- Citizen ➜ Government language
- Government notice ➜ Simple explanation
- Legal jargon ➜ Plain English
- Tone analyzer for complaints

---

### Confidence Coach

Practice before filing complaints.

Includes:

- AI roleplay with a municipal officer
- Communication feedback
- Official document templates:
  - RTI Application
  - Complaint Letter
  - Appeal Letter
  - Reminder Letter
  - Escalation Letter

---

### Collective Petition Generator

Generate a professional petition from multiple complaints.

Outputs include:

- Petition title
- Formal petition letter
- Key demands

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 |
| Language | TypeScript |
| UI | React 19 |
| Animations | Framer Motion |
| Icons | Lucide React |
| AI | Google Gemini 2.5 Flash |
| Styling | Tailwind CSS 4 |

---

## Project Structure

```
app/
├── api/
│   ├── generate/
│   ├── translate/
│   ├── coach/
│   ├── petition/
│   └── health/
├── page.tsx
components/
public/
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/promptwars.git

cd promptwars
```

Install dependencies:

```bash
npm install
```

Create an environment file:

```env
GEMINI_API_KEY=your_google_ai_api_key
```

Run the development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## API Endpoints

### Generate Complaint

```
POST /api/generate
```

Creates structured complaint drafts with analysis and recommendations.

---

### Translator

```
POST /api/translate
```

Supports:

- Citizen → Official
- Official → Citizen
- Legal Jargon
- Tone Analysis

---

### Confidence Coach

```
POST /api/coach
```

Supports:

- Roleplay mode
- Government document templates

---

### Petition Generator

```
POST /api/petition
```

Creates a collective petition from multiple citizen complaints.

---

### Health Check

```
GET /api/health
```

Verifies API availability.

---

## Example Workflow

1. Enter a civic issue.
2. Select location and category.
3. Generate AI-enhanced complaint.
4. Review suggested department and escalation path.
5. Improve tone if necessary.
6. Practice explaining the issue using the Confidence Coach.
7. Generate a petition if multiple residents face the same problem.

---

## Future Improvements

- Multi-language support
- Complaint tracking dashboard
- Government portal integrations
- Voice-to-complaint input
- OCR for notices
- Complaint analytics
- Location-aware department recommendations
- PDF export
- Email-ready complaint generation

---

## Environment Variables

```env
GEMINI_API_KEY=YOUR_API_KEY
```

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

##  Author

Built to simplify civic communication by making government processes more accessible through AI.