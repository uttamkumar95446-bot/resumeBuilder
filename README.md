# Resume Shapeshifter 🎯

**AI-powered resume tailoring with truthfulness guarantees.**

Analyze your resume against any job description, get a match score, identify gaps, and generate a targeted, truthful tailored resume — all from your browser.

## Features

- **Match Scoring** — Get a 0–100% explainable match score across skill coverage, responsibility alignment, keyword matching, and seniority fit.
- **Bullet Rewriting** — Rewrite experience bullets to better match job requirements while preserving your actual experience.
- **Gap Analysis** — Identify missing skills, weak areas, and get actionable suggestions.
- **Side-by-Side Comparison** — Review original vs tailored versions with highlighted changes and confidence indicators.
- **PDF Export** — Download a clean ATS-friendly tailored resume or a full comparison report.
- **Truthfulness Guardrails** — Automatic detection of new companies, numbers, technologies, and inflated claims. User confirmation before export.
- **Progress Tracking** — Visual step indicator showing Input → Analysis → Tailor → Export flow.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 + Shadcn UI |
| Language | TypeScript |
| AI API | Groq (llama-3.3-70b-versatile) |
| PDF Generation | Playwright |
| Validation | Zod schemas |
| Testing | Vitest + Playwright |

## Getting Started

### Prerequisites

- Node.js 20+
- A [Groq](https://console.groq.com) API key (free tier available)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd resume-shapeshifter

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Groq API key:
# GROQ_API_KEY=your_key_here
# GROQ_MODEL=llama-3.3-70b-versatile

# Start development server
npm run dev
```

Visit `http://localhost:3000` to use the app.

### Sample Data

Click **"Load Sample Data"** on the dashboard to auto-fill a sample Full-Stack Developer resume and Senior Frontend Engineer job description for a quick demo.

## Usage

1. **Paste your resume** (plain text) in the left panel
2. **Paste a job description** in the right panel
3. Click **"Analyze Match"** or press **Ctrl+Enter**
4. Review your match score, JD summary, and gap analysis
5. Click **"Generate Tailored Resume"** to get a rewritten version
6. Review changes side-by-side with confidence indicators
7. Click **"Export PDF"** to download your tailored resume or comparison report

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (analyze, tailor, export-pdf, etc.)
│   ├── dashboard/          # Input & results pages
│   └── export/             # Export/pages
├── components/             # React components
│   ├── ui/                 # Shadcn UI primitives
│   ├── Skeleton.tsx        # Loading skeleton components
│   └── ProgressSteps.tsx   # Step progress indicator
├── hooks/                  # Custom React hooks
├── lib/
│   ├── llm/                # Groq client, cache, prompt runner
│   ├── mock/               # Mock data for development
│   ├── pdf/                # PDF generation templates
│   ├── schemas/            # Zod validation schemas
│   ├── services/           # Business logic & orchestrator
│   └── utils/              # Utilities (validation, rate limiting, logging, truthfulness)
├── styles/                 # Global CSS
└── types/                  # TypeScript type exports

public/samples/             # Sample resume & JD text files
tests/                      # Unit and integration tests
```

## Running Tests

```bash
npm test                    # Run unit tests
npm run test:e2e            # Run Playwright E2E tests
```

## Deployment

This app can be deployed to any Node.js hosting platform (Vercel, Railway, Render, etc.).

**Important:** Playwright-based PDF generation requires a headless Chromium binary. For Vercel, use the `@sparticuz/chromium` package. For Docker deployments, include Chromium in your image.

## License

MIT
