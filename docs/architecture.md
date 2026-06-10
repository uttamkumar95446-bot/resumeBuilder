# Resume Shapeshifter — Architecture Document

> **Version:** 1.0
> **Status:** Draft
> **Last Updated:** June 9, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Core Modules & Services](#4-core-modules--services)
5. [Data Flow](#5-data-flow)
6. [API Design](#6-api-design)
7. [Database Schema](#7-database-schema)
8. [LLM Prompt Architecture](#8-llm-prompt-architecture)
9. [Frontend Component Tree](#9-frontend-component-tree)
10. [Security & Truthfulness Guardrails](#10-security--truthfulness-guardrails)
11. [Error Handling & Edge Cases](#11-error-handling--edge-cases)
12. [Performance Considerations](#12-performance-considerations)
13. [Deployment](#13-deployment)
14. [Development Phases](#14-development-phases)
15. [Project Structure](#15-project-structure)
16. [Glossary](#16-glossary)

---

## 1. Project Overview

**Resume Shapeshifter** is a JD-to-resume tailoring engine. Users provide a job description (JD) and an existing resume; the system generates a tailored version of the resume that better aligns with the job listing while preserving truthfulness and the user's actual experience.

### 1.1 Core Capabilities

| Capability | Description |
|---|---|
| **Resume Parsing** | Convert pasted/uploaded resume content into structured JSON with logical sections |
| **JD Parsing** | Extract job title, skills, responsibilities, qualifications, tools, and keywords from a job description |
| **Match Scoring** | Generate an explainable 0–100 match score for original and tailored resumes |
| **Bullet Rewriting** | Rewrite experience bullets to align with the JD while preserving truthfulness |
| **Gap Analysis** | Flag missing/weakly represented skills, tools, and experience |
| **PDF Export** | Generate a tailored resume PDF and a side-by-side comparison PDF |

### 1.2 Design Principles

- **Truthfulness first** — Never fabricate experience, metrics, employers, or credentials.
- **Explainability** — Every score, rewrite, and gap is accompanied by a human-readable explanation.
- **User control** — All changes require user review; users confirm before export.
- **ATS-friendly output** — Generated resumes use clean, parseable formatting.
- **Vertical slice delivery** — Prioritize a working end-to-end flow over broad feature coverage.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌─────────┐  ┌──────────────┐  │
│  │Resume    │  │JD        │  │Score      │  │Gap      │  │Side-by-      │  │
│  │Input     │  │Input     │  │Card       │  │Analysis │  │Side Diff     │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └────┬────┘  └──────┬───────┘  │
│       │              │              │              │              │          │
│  ┌────┴──────────────┴──────────────┴──────────────┴──────────────┴──────┐  │
│  │                      API Client (fetch)                               │  │
│  └────────────────────────────────┬───────────────────────────────────────┘  │
└───────────────────────────────────┼─────────────────────────────────────────┘
                                    │ HTTP
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NEXT.JS APPLICATION                                 │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │                         API Routes Layer                              │    │
│  │                                                                        │    │
│  │  POST /api/parse-resume   → Resume Parser Service                     │    │
│  │  POST /api/parse-jd       → JD Parser Service                         │    │
│  │  POST /api/analyze        → Orchestrator Service                      │    │
│  │  POST /api/tailor         → Tailoring Service                         │    │
│  │  POST /api/export-pdf     → PDF Generation Service                    │    │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                      │
│  ┌────────────────────────────────────┴────────────────────────────────────┐ │
│  │                             Service Layer                                │ │
│  │                                                                          │ │
│  │  ┌─────────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐    │ │
│  │  │ Resume      │  │ JD       │  │ Match     │  │ PDF              │    │ │
│  │  │ Parser      │  │ Parser   │  │ Scorer    │  │ Generator        │    │ │
│  │  └──────┬──────┘  └────┬─────┘  └─────┬─────┘  └────────┬─────────┘    │ │
│  │         │              │               │                 │               │ │
│  │  ┌──────┴──────────────┴───────────────┴─────────────────┴──────────┐   │ │
│  │  │                        LLM Client (Groq)                        │   │ │
│  │  │  ┌──────────┐  ┌────────────┐  ┌───────────┐  ┌──────────────┐  │   │ │
│  │  │  │JD Extract│  │Resume      │  │Match      │  │Bullet        │  │   │ │
│  │  │  │Prompt    │  │Parser      │  │Scoring    │  │Rewriter      │  │   │ │
│  │  │  │          │  │Prompt      │  │Prompt     │  │Prompt        │  │   │ │
│  │  │  └──────────┘  └────────────┘  └───────────┘  └──────────────┘  │   │ │
│  │  │  ┌──────────┐  ┌────────────┐                                  │   │ │
│  │  │  │Gap       │  │Resume      │                                  │   │ │
│  │  │  │Analysis  │  │Assembler   │                                  │   │ │
│  │  │  │Prompt    │  │Prompt      │                                  │   │ │
│  │  │  └──────────┘  └────────────┘                                  │   │ │
│  │  └─────────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                        │                                     │
│  ┌────────────────────────────────────┴────────────────────────────────────┐ │
│  │                             Data Layer                                  │ │
│  │                                                                          │ │
│  │  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌─────────────────────┐    │ │
│  │  │ SQLite  │  │ Session  │  │ File      │  │ Zod Schemas         │    │ │
│  │  │/Supabase│  │ Storage  │  │ Uploads   │  │ (runtime validation)│    │ │
│  │  └─────────┘  └──────────┘  └───────────┘  └─────────────────────┘    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Architecture Decisions

| Decision | Rationale |
|---|---|
| **Next.js (full-stack)** | Single framework for frontend + API routes; reduces context switching; excellent DX |
| **LLM as a service (Groq)** | LLM handles NLP-heavy tasks (parsing, scoring, rewriting) where traditional NLP would be brittle; Groq provides fast inference via Llama models |
| **Prompt-per-task separation** | Isolated prompts for JD extraction, resume parsing, scoring, rewriting, gap analysis — each is independently testable and improvable |
| **Zod schemas everywhere** | Every JSON structure is a Zod schema for runtime validation + TypeScript type generation |
| **Session-based storage (MVP)** | No auth required for MVP; simplifies initial build |
| **Server-side LLM calls** | API keys stay on the server; never exposed to the client |

### 2.3 Architectural Constraints

- No automatic job applications or web scraping.
- All LLM outputs must be validated against Zod schemas before being returned.
- All content changes must preserve truthfulness.
- PDF generation must be server-side to allow proper rendering.

---

## 3. Tech Stack

### 3.1 Frontend

| Technology | Purpose |
|---|---|
| **Next.js 14+** (App Router) | Full-stack React framework |
| **React 18+** | UI component library |
| **TypeScript** | Type safety across the entire stack |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn UI** | Accessible, composable UI primitives |
| **TanStack Query** | Server state management & caching |

### 3.2 Backend

| Technology | Purpose |
|---|---|
| **Next.js API Routes** | Server-side logic (file-based routing, same project) |
| **Zod** | Runtime schema validation + TypeScript type generation |
| **Drizzle ORM** | Lightweight TypeScript ORM for database access |

### 3.3 LLM & AI

| Technology | Purpose |
|---|---|
| **Groq API** (llama-3.3-70b-versatile / llama-3.1-8b-instant) | Fast LLM inference for parsing, scoring, and rewriting; `response_format: { type: "json_object" }` for structured output |
| **Separate prompt files** | Organized by task; each prompt in its own file under `/prompts/` |

### 3.4 Document Processing

| Technology | Purpose |
|---|---|
| **mammoth.js** | DOCX → plain text extraction |
| **pdf-parse** | PDF → plain text extraction |
| **Playwright** (headless) | Server-side PDF generation (tailored + comparison PDFs) |

### 3.5 Storage (MVP)

| Technology | Purpose |
|---|---|
| **SQLite** (via Drizzle ORM) | Lightweight, zero-config local storage |
| **Session cookies** | Ephemeral client state |

### 3.6 Development & Quality

| Technology | Purpose |
|---|---|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Vitest** | Unit & integration tests |
| **Playwright** | E2E tests |

---

## 4. Core Modules & Services

### 4.1 Resume Parser Service

**File:** `src/lib/services/resume-parser.ts`

**Input:** Raw text string (from paste, PDF extraction, or DOCX extraction)

**Output:** `ResumeProfile` (Zod-validated)

**Flow:**
```
Raw Text → [Optional: PDF/DOCX Extractors] → [LLM Resume Parser Prompt] → Structured JSON → Zod Validation → ResumeProfile
```

**Edge cases:**
- Multi-column PDFs may produce scrambled text → flag for user review
- Empty or very short input → return validation error
- Missing sections → return empty arrays rather than failing
- Non-English resumes → preserve language, add `language` metadata field

### 4.2 JD Parser Service

**File:** `src/lib/services/jd-parser.ts`

**Input:** Job description text (pasted by user)

**Output:** `JobDescriptionProfile` (Zod-validated)

**Flow:**
```
JD Text → [LLM JD Extraction Prompt] → Structured JSON → Zod Validation → JobDescriptionProfile
```

**Edge cases:**
- Extremely long JDs → truncate to token limit with warning
- JDs without company names → leave field null
- Vague JDs with minimal detail → return with low confidence flags

### 4.3 Match Scorer Service

**File:** `src/lib/services/match-scorer.ts`

**Input:** `ResumeProfile` + `JobDescriptionProfile`

**Output:** `MatchScore` (Zod-validated)

**Scoring dimensions:**

| Dimension | Weight (approx.) | Description |
|---|---|---|
| Required Skill Coverage | 35% | % of required skills present in the resume |
| Preferred Skill Coverage | 15% | % of preferred/nice-to-have skills present |
| Responsibility Alignment | 25% | How well experience bullets match JD responsibilities |
| Keyword Alignment | 10% | Domain-specific terminology overlap |
| Seniority Alignment | 10% | Does the resume imply a matching seniority level |
| Critical Requirements | 5% | Absence of any deal-breaker requirements |

### 4.4 Tailoring Service (Bullet Rewriter)

**File:** `src/lib/services/tailoring-service.ts`

**Input:** `ResumeProfile` + `JobDescriptionProfile`

**Output:** `TailoredResume` (Zod-validated)

**Flow:**
```
ResumeProfile + JDProfile → [Bullet Rewriter Prompt] → [Summary Rewriter] → [Skill Reorderer] → Structured JSON → Zod Validation → TailoredResume
```

**Bullet rewriting rules (enforced via prompt):**
1. Preserve original meaning and factual claims
2. Use stronger action verbs relevant to the role
3. Include JD-relevant terminology only where truthful
4. Preserve measurable impact (numbers, percentages, scale)
5. Do not add unsupported metrics
6. Do not add employers, degrees, or certifications the user does not have
7. Do not claim expert-level proficiency unless supported
8. If uncertain, mark as low confidence and flag for user review

Each rewritten bullet includes metadata:
- `original` — Original bullet text
- `tailored` — Rewritten bullet text
- `changeReason` — Why the change was made
- `keywordsAddressed` — JD keywords addressed
- `confidence` — high / medium / low
- `riskFlag` — Warning if the change may overstate experience

### 4.5 Gap Analysis Service

**File:** `src/lib/services/gap-analysis.ts`

**Input:** `ResumeProfile` + `JobDescriptionProfile` + `MatchScore`

**Output:** `GapAnalysis` (Zod-validated)

Each gap includes:
- `name` — Gap name
- `importance` — high / medium / low
- `jdEvidence` — Evidence from the JD
- `resumeEvidence` — Whether the resume mentions it
- `suggestedAction` — What the user should do

**Suggested action types:**

| Action | Meaning |
|---|---|
| `Add if you have this experience` | User likely has it but didn't list it |
| `Leave out if not true` | Don't fabricate — prepare to discuss in interview |
| `Mention in skills section` | User has familiarity but only if truthful |
| `Add a project bullet` | If the user has a relevant project demonstrating this |
| `Prepare for interview` | Important gap that cannot be truthfully added to resume |

### 4.6 Resume Assembler Service

**File:** `src/lib/services/resume-assembler.ts`

**Input:** Original `ResumeProfile` + tailored sections

**Output:** Final assembled `TailoredResume`

### 4.7 PDF Generator Service

**File:** `src/lib/services/pdf-generator.ts`

**Two PDF documents:**

1. **Tailored Resume PDF** — Clean, ATS-friendly single-column layout
2. **Side-by-Side Comparison PDF** — Original (left) vs Tailored (right) with highlighted changes, scores, gap analysis, and disclaimer

### 4.8 Orchestrator Service

**File:** `src/lib/services/orchestrator.ts`

**Flow:**
```
1. Resume Parser → ResumeProfile
2. JD Parser → JobDescriptionProfile
3. Match Scorer (original) → OriginalMatchScore
4. Gap Analysis (original) → Gaps
5. Tailoring Service → TailoredResume
6. Match Scorer (tailored) → TailoredMatchScore
7. Gap Analysis (tailored) → TailoredGaps
8. Compile TailoringRun
```

**Parallelization:** Steps 1+2 can run in parallel; 3+4 can run in parallel; 6+7 can run in parallel.

---

## 5. Data Flow

### 5.1 End-to-End User Flow

```
User Action                    Server Action                    LLM Call
─────────────                  ─────────────                    ────────
1. Paste resume text    ──►   POST /api/parse-resume    ──►    Resume Parser Prompt
2. Paste JD text        ──►   POST /api/parse-jd        ──►    JD Extraction Prompt
3. Click "Analyze"      ──►   POST /api/analyze
                                ├── Match Scorer (original)   ──► Scoring Prompt
                                └── Gap Analysis (original)   ──► Gap Analysis Prompt
4. Click "Tailor"       ──►   POST /api/tailor
                                ├── Bullet Rewriter           ──► Rewriter Prompt
                                ├── Summary Rewriter          ──► Rewriter Prompt
                                └── Skill Reorderer           ──► Reorderer Prompt
5. Review changes       ◄──   Return TailoredResume + scores + gaps
6. Click "Export PDF"   ──►   POST /api/export-pdf
                                ├── Generate HTML template
                                ├── Playwright renders HTML
                                └── Return PDF buffer
7. Download PDF         ◄──   PDF binary stream
```

### 5.2 Data Flow Diagram

```
┌──────────────┐    ┌─────────────────┐    ┌─────────────────────┐
│  User Input   │    │  Parse & Extract │    │  LLM Processing     │
│              │    │                  │    │                     │
│ Resume Text  │───►│ Resume Parser    │───►│ Resume Parsing Prompt│
│ JD Text      │───►│ JD Parser        │───►│ JD Extraction Prompt│
└──────────────┘    └────────┬─────────┘    └──────────┬──────────┘
                             │                          │
                             ▼                          ▼
                     ┌──────────────┐         ┌────────────────────┐
                     │   Zod Schema  │         │  Structured JSON   │
                     │  Validation   │◄────────│  from LLM          │
                     └──────┬───────┘         └────────────────────┘
                            │
                            ▼
                     ┌──────────────────────────────────────────────┐
                     │            Orchestrator Service               │
                     │                                              │
                     │  ResumeProfile + JDProfile                   │
                     │         │                                     │
                     │         ├──→ Match Scorer (original)         │
                     │         ├──→ Gap Analysis (original)         │
                     │         ├──→ Tailoring Service               │
                     │         │       ├── Bullet Rewriter          │
                     │         │       ├── Summary Rewriter         │
                     │         │       └── Skill Reorderer          │
                     │         ├──→ Match Scorer (tailored)         │
                     │         └──→ Gap Analysis (tailored)         │
                     │                                              │
                     │         ↓                                    │
                     │  TailoringRun { resume, jd, originalScore,   │
                     │    tailoredScore, gaps, tailoredResume }     │
                     └──────────────────┬───────────────────────────┘
                                        │
                                        ▼
                     ┌──────────────────────────────────────────────┐
                     │            Client (Browser)                   │
                     │  ScoreCard → GapAnalysis → SideBySideDiff    │
                     │  User reviews and clicks "Export PDF"        │
                     └──────────────────┬───────────────────────────┘
                                        │
                                        ▼
                     ┌──────────────────────────────────────────────┐
                     │          PDF Generator (Server)               │
                     │  HTML Template → Playwright → PDF Buffer     │
                     │  Returns PDF to client for download          │
                     └──────────────────────────────────────────────┘
```

---

## 6. API Design

### 6.1 API Routes

All routes under `/api/` using Next.js App Router.

#### `POST /api/parse-resume`

**Request:**
```json
{ "text": "string (required) – pasted resume content" }
```

**Response (200):**
```json
{ "resume": { /* ResumeProfile */ }, "warnings": ["..."] }
```

#### `POST /api/parse-jd`

**Request:**
```json
{ "text": "string (required) – pasted JD content" }
```

**Response (200):**
```json
{ "jd": { /* JobDescriptionProfile */ }, "warnings": [] }
```

#### `POST /api/analyze`

**Request:**
```json
{
  "resumeText": "string (required)",
  "jdText": "string (required)"
}
```

**Response (200):**
```json
{
  "resume": { /* ResumeProfile */ },
  "jd": { /* JobDescriptionProfile */ },
  "originalScore": { /* MatchScore */ },
  "originalGaps": { /* GapAnalysis */ }
}
```

#### `POST /api/tailor`

**Request:**
```json
{
  "resumeText": "string (required)",
  "jdText": "string (required)"
}
```

**Response (200):**
```json
{
  "tailoredResume": { /* TailoredResume */ },
  "tailoredScore": { /* MatchScore */ },
  "tailoredGaps": { /* GapAnalysis */ },
  "warnings": ["Low-confidence or risk-flagged changes"]
}
```

#### `POST /api/export-pdf`

**Request:**
```json
{
  "type": "'tailored' | 'comparison'",
  "resume": { /* ResumeProfile */ },
  "jd": { /* JobDescriptionProfile */ },
  "originalScore": { /* MatchScore */ },
  "tailoredResume": { /* TailoredResume */ },
  "tailoredScore": { /* MatchScore */ },
  "gaps": { /* GapAnalysis */ }
}
```

**Response (200):** PDF binary stream with `Content-Type: application/pdf`.

### 6.2 Error Response Format

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common error codes: `VALIDATION_ERROR`, `LLM_ERROR`, `PARSING_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR`.

---

## 7. Database Schema

### 7.1 Entity Relationship (MVP)

```
┌──────────────┐       ┌──────────────────┐
│    User       │       │  TailoringRun     │
│──────────────│       │──────────────────│
│ id (PK)      │──┐    │ id (PK)          │
│ createdAt     │  └───►│ userId (FK)      │
│               │       │ resumeId (FK)    │
└──────────────┘       │ jdId (FK)        │
                        │ createdAt        │
┌──────────────┐       │ originalScoreId  │
│   Resume      │       │ tailoredScoreId  │
│──────────────│       │ gapAnalysisId    │
│ id (PK)      │◄──────│ tailoredResumeId │
│ userId (FK)  │       │ exportedPdfIds   │
│ rawText      │       └──────────────────┘
│ parsedJson   │
│ sourceType   │       ┌──────────────────┐
│ createdAt     │       │   MatchScore     │
└──────────────┘       │──────────────────│
                        │ id (PK)         │
┌──────────────┐       │ overallScore    │
│ JobDescription│       │ skillScore      │
│──────────────│       │ respScore       │
│ id (PK)      │       │ keywordScore    │
│ userId (FK)  │       │ seniorityScore  │
│ rawText      │       │ explanation     │
│ parsedJson   │       │ scoreType       │
│ createdAt     │       └──────────────────┘
└──────────────┘
```

### 7.2 SQL Schema (SQLite)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE resumes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES users(id),
  raw_text TEXT NOT NULL,
  parsed_json TEXT,
  source_type TEXT CHECK(source_type IN ('paste', 'pdf', 'docx')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE job_descriptions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES users(id),
  raw_text TEXT NOT NULL,
  parsed_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE match_scores (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  overall_score REAL NOT NULL,
  skill_coverage_score REAL,
  responsibility_alignment_score REAL,
  keyword_score REAL,
  seniority_score REAL,
  critical_missing_requirements TEXT,
  explanation TEXT,
  score_type TEXT CHECK(score_type IN ('original', 'tailored')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE tailored_resumes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  summary TEXT,
  skills_json TEXT,
  experience_json TEXT,
  projects_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE gap_analyses (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  gaps_json TEXT NOT NULL,
  analysis_type TEXT CHECK(analysis_type IN ('original', 'tailored')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE tailoring_runs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES users(id),
  resume_id TEXT REFERENCES resumes(id),
  jd_id TEXT REFERENCES job_descriptions(id),
  original_score_id TEXT REFERENCES match_scores(id),
  tailored_score_id TEXT REFERENCES match_scores(id),
  tailored_resume_id TEXT REFERENCES tailored_resumes(id),
  original_gap_id TEXT REFERENCES gap_analyses(id),
  tailored_gap_id TEXT REFERENCES gap_analyses(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE exported_documents (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  run_id TEXT REFERENCES tailoring_runs(id),
  document_type TEXT CHECK(document_type IN ('tailored', 'comparison')),
  pdf_blob BLOB,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### 7.3 Session-Based Storage (MVP Alternative)

For the MVP without authentication, use an in-memory store keyed by session ID (UUID stored in a cookie):

```typescript
interface SessionStore {
  resume?: ResumeProfile;
  jd?: JobDescriptionProfile;
  originalScore?: MatchScore;
  tailoredScore?: MatchScore;
  gaps?: GapAnalysis;
  tailoredResume?: TailoredResume;
}
```

---

## 8. LLM Prompt Architecture

### 8.1 Prompt Organization

```
/prompts/
├── jd-extraction.ts       # Extract structured data from job description
├── resume-parser.ts       # Parse raw resume text into sections
├── match-scoring.ts       # Score resume against JD
├── bullet-rewriter.ts     # Rewrite experience bullets
├── summary-rewriter.ts    # Rewrite professional summary
├── skill-reorderer.ts     # Reorder/emphasize skills by JD relevance
├── gap-analysis.ts        # Identify gaps between resume and JD
└── resume-assembler.ts    # Assemble final tailored resume structure
```

### 8.2 Prompt Template Pattern

Each prompt follows a consistent pattern:

```typescript
export const JD_EXTRACTION_PROMPT = `You are a job description analyzer...

Instructions:
- Extract all technical and non-technical skills
- Distinguish required vs preferred skills
- Identify tools, platforms, technologies
- Detect seniority level
- Return valid JSON matching the provided schema

Job Description:
{{JD_TEXT}}

Return JSON:
{
  "jobTitle": "...",
  "company": "... or null",
  "requiredSkills": ["..."],
  "preferredSkills": ["..."],
  "responsibilities": ["..."],
  "qualifications": ["..."],
  "tools": ["..."],
  "keywords": ["..."],
  "seniorityLevel": "entry | mid | senior | lead | manager | director",
  "domainSignals": ["..."],
  "softSkills": ["..."]
}`;
```

### 8.3 Prompt Design Rules

1. **Explicit JSON schema** — Provide exact structure the LLM must return
2. **Truthfulness enforcement** — "Never invent experience," "Use only evidence from the resume"
3. **Uncertainty handling** — Include `confidence` and `riskFlag` fields
4. **Role anchoring** — "You are a [specific role]" to anchor behavior
5. **Output constraints** — "Keep bullet length under 2 lines"
6. **Few-shot examples** — For complex tasks (bullet rewriting, gap classification)

### 8.4 Structured Output Strategy

Use Groq's `response_format: { type: "json_object" }` (with "JSON" in the system prompt) for structured JSON output.

Groq supports:
- `response_format: { type: "json_object" }` — requires the word "JSON" in the prompt
- `response_format: { type: "json_schema", json_schema: { ... } }` — strict schema enforcement (preferred where available)

After LLM response, validate against Zod schemas:

```typescript
import { z } from 'zod';

export const MatchScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  skillCoverageScore: z.number().min(0).max(100),
  responsibilityAlignmentScore: z.number().min(0).max(100),
  keywordScore: z.number().min(0).max(100),
  seniorityScore: z.number().min(0).max(100),
  criticalMissingRequirements: z.array(z.string()),
  explanation: z.string().min(10)
});

export type MatchScore = z.infer<typeof MatchScoreSchema>;
```

---

## 9. Frontend Component Tree

### 9.1 Page Structure

```
/app
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout
├── /dashboard/
│   ├── page.tsx                # Resume + JD input
│   └── /results/
│       └── page.tsx            # Analysis results
├── /api/*                      # API routes
└── /export/
    └── page.tsx                # Export & download
```

### 9.2 Component Hierarchy

```
<App>
  <LandingPage />
  <DashboardPage>
    <ResumeInput />     ─── TextArea, FileUpload, ParseStatus
    <JDInput />         ─── TextArea, ParseStatus
    <AnalyzeButton />
  </DashboardPage>
  <ResultsPage>
    <JDSummaryCard />
    <ScoreCard>
      ├── ScoreGauge (before vs after)
      ├── ScoreBreakdown
      └── ScoreExplanation
    <GapAnalysis>
      └── GapItem[] (name, importance, evidence, suggestion)
    <SideBySideDiff>
      ├── SectionSelector (tabs: summary/skills/experience)
      ├── OriginalColumn
      └── TailoredColumn
          └── BulletItem (original, tailored, reason, keywords, confidence, risk)
    <TailorButton />
    <ExportButton />
  </ResultsPage>
  <ExportPage>
    ├── DownloadTailoredPdfButton
    ├── DownloadComparisonPdfButton
    └── PreviewPane (read-only diff)
</App>
```

### 9.3 Key Component Responsibilities

| Component | Responsibility |
|---|---|
| `ResumeInput` | Handle paste + file upload (PDF/DOCX) |
| `JDInput` | Handle paste input |
| `ScoreCard` | Display original vs tailored scores with gauge visualization |
| `GapAnalysis` | Display filterable gap list by importance |
| `SideBySideDiff` | Show tabbed original vs tailored comparison |
| `BulletItem` | Show original, tailored text, change reason, confidence badge |
| `ExportButton` | Trigger PDF generation and download |

---

## 10. Security & Truthfulness Guardrails

### 10.1 Enforcement Layers

**Layer 1 — Prompt Instructions:**
- Every prompt includes explicit "do not fabricate" instructions
- Prompts specify "only use evidence from the resume"
- Risk-flag instructions for uncertain changes

**Layer 2 — LLM Output Validation:**
- Zod schema validation catches malformed values
- Custom validators check for hallucinated content patterns

**Layer 3 — Post-Processing Checks:**
- Diff original vs tailored for unsupported additions
- Flag bullets where confidence < 0.7
- Flag bullets with non-empty riskFlag

**Layer 4 — User Review Gate:**
- Side-by-side view requires scrolling through all changes
- "Confirm all changes are accurate" checkbox before export
- Exported PDF includes truthfulness disclaimer

### 10.2 Blocked Actions

| Action | Enforcement |
|---|---|
| Adding fake employers | Prompt + post-processing diff |
| Adding fake degrees/certifications | Prompt; certs section not rewritten by default |
| Adding unsupported metrics | Prompt + regex check for new numbers |
| Claiming expert proficiency | Prompt; confidence field flags uncertainty |
| Adding non-existent technologies | Prompt + cross-reference with original skills |
| Keyword stuffing | Prompt + post-processing density check |

### 10.3 Required Disclaimers

1. "This tool suggests improvements — it does not guarantee ATS performance or interview calls."
2. "Review all changes carefully before submitting your resume."
3. "Do not include experience, skills, or qualifications you do not actually have."
4. "Low-confidence changes are marked — verify them against your actual experience."

### 10.4 API Security

- LLM API keys stored as environment variables only
- Input validation on all API routes via Zod
- Request size limits (max 50KB each for resume and JD)
- Rate limiting (10 requests/min/session)
- No user authentication in MVP — session-based isolation is acceptable

---

## 11. Error Handling & Edge Cases

### 11.1 Parsing Errors

| Scenario | Handling |
|---|---|
| PDF parsing scrambled | Return with warning; suggest paste instead |
| DOCX parsing fails | Fall back to pasted text |
| Empty resume text | Require at least 50 characters |
| Resume with no experience | Allow; mark incomplete; adjust scoring |
| JD text > 10K tokens | Truncate and warn |

### 11.2 LLM Errors

| Scenario | Handling |
|---|---|
| Invalid JSON response | Retry once with stricter schema |
| Timeout (>30s) | Return error with "try again" |
| Rate limit hit | Retry with exponential backoff |
| Zod validation failure | Return error details; suggest retry |

### 11.3 Business Logic Edge Cases

| Scenario | Handling |
|---|---|
| Resume already perfect match | High score (80+); minimal rewriting; explain each unchanged bullet |
| No relevant experience | Low score; extensive gap analysis; focus on transferable skills |
| Vague JD | Low-confidence scores; flag lack of specificity |
| Different language | Detect and preserve; add language metadata |
| Same input twice | Return cached session results |

### 11.4 PDF Generation Errors

| Scenario | Handling |
|---|---|
| Playwright fails | Fall back to PDFKit/jsPDF |
| File > 10MB | Compress; suggest text-only export |

---

## 12. Performance Considerations

### 12.1 LLM Call Latency Estimates

| Operation | Latency | Parallelizable |
|---|---|---|
| Resume parsing | 3–8s | Yes (with JD parsing) |
| JD parsing | 3–8s | Yes (with resume parsing) |
| Match scoring (original) | 3–8s | Yes (with gap analysis) |
| Gap analysis (original) | 3–8s | Yes (with match scoring) |
| Bullet rewriting | 5–15s | No (sequential per section) |
| Summary rewriting | 3–5s | Yes (with bullet rewriting) |
| Skill reordering | 2–4s | No |
| Match scoring (tailored) | 3–8s | Yes (with tailored gaps) |
| Gap analysis (tailored) | 3–8s | Yes (with tailored scoring) |

**Total end-to-end estimate:** 20–50s for complete "Analyze + Tailor" flow.

### 12.2 Caching Strategy

| Cache Level | Key | TTL |
|---|---|---|
| LLM Response | Hash(prompt + input) | 1 hour |
| Session | Session ID | Session lifetime |
| PDF | Hash(all input + type) | 24 hours |

### 12.3 Optimization Strategies

- Use `llama-3.1-8b-instant` for extraction tasks; `llama-3.3-70b-versatile` for creative rewriting
- Parallelize independent LLM calls (see above)
- Stream LLM responses for progressive display (optional)
- Use React Suspense for progressive UI rendering
- Lazy-load PDF export dependencies

---

## 13. Deployment

### 13.1 Local Development

```bash
git clone <repo-url>
cd resume-shapeshifter
npm install
cp .env.local.example .env.local  # Set GROQ_API_KEY
npm run dev                   # Start dev server
npm run test                # Run tests
```

### 13.2 Environment Variables

```env
# Required
GROQ_API_KEY=gsk_your_key_here

# Optional
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MODEL_FAST=llama-3.1-8b-instant
DATABASE_URL=file:./resume-shapeshifter.db
MAX_TEXT_INPUT_LENGTH=50000
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000
```

### 13.3 Production Deployment

| Platform | Notes |
|---|---|
| **Vercel** | Best for Next.js; API routes + Serverless Functions |
| **Railway** | Good for Next.js + persistent SQLite |
| **Fly.io** | Supports long-running processes for PDF generation |
| **Docker** | Self-hosted with Chromium for Playwright |

**Considerations:**
- Playwright PDF generation requires Chromium — use Docker image with pre-installed Chromium
- LLM calls may exceed Vercel's 10s Serverless Function timeout — consider streaming or async worker
- Switch from SQLite to Supabase/PostgreSQL for multi-instance production

### 13.4 CI/CD Pipeline (Suggested)

```
Git Push → GitHub Actions:
  1. Install dependencies
  2. Lint (ESLint + Prettier)
  3. Type check (tsc --noEmit)
  4. Unit tests (Vitest)
  5. E2E tests (Playwright)
  6. Build (next build)
  7. Deploy (Vercel / Railway)
```

---

## 14. Development Phases

### Phase 1: Static Prototype (3–5 days)

- [ ] Next.js project setup (TypeScript, Tailwind, Shadcn UI)
- [ ] Landing page
- [ ] Resume input component (paste + file upload stubs)
- [ ] JD input component (paste)
- [ ] Mock score card (hardcoded data)
- [ ] Mock gap analysis (hardcoded data)
- [ ] Side-by-side diff UI (static)
- [ ] Zod schemas for all data types

### Phase 2: LLM Integration (5–7 days)

- [ ] Groq client setup + env configuration
- [ ] JD extraction prompt + service
- [ ] Resume parsing prompt + service
- [ ] Match scoring prompt + service
- [ ] Bullet rewriting prompt + service
- [ ] Gap analysis prompt + service
- [ ] Orchestrator service
- [ ] All API routes with Zod validation

### Phase 3: PDF Export (3–4 days)

- [ ] HTML templates for both PDF types
- [ ] Playwright PDF generation service
- [ ] PDF download API route
- [ ] Export page with download buttons

### Phase 4: Validation & Guardrails (2–3 days)

- [ ] Post-processing truthfulness checks
- [ ] Confidence and risk flagging system
- [ ] User confirmation flow before export
- [ ] Disclaimers in UI and PDF
- [ ] Edge case error handling

### Phase 5: Polish & Demo (2–3 days)

- [ ] Loading states and skeleton screens
- [ ] Error boundaries and toast notifications
- [ ] Sample resume + JD for demo
- [ ] Responsive design pass
- [ ] Performance optimization
- [ ] README and documentation

---

## 15. Project Structure

```
resume-shapeshifter/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── vitest.config.ts
│
├── /docs/
│   ├── ProblemStatement.md
│   └── architecture.md              # This file
│
├── /prompts/                        # LLM prompt templates
│   ├── jd-extraction.ts
│   ├── resume-parser.ts
│   ├── match-scoring.ts
│   ├── bullet-rewriter.ts
│   ├── summary-rewriter.ts
│   ├── skill-reorderer.ts
│   ├── gap-analysis.ts
│   └── resume-assembler.ts
│
├── /src/
│   ├── /app/                        # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Landing page
│   │   ├── /dashboard/
│   │   │   ├── page.tsx             # Input page
│   │   │   └── /results/
│   │   │       └── page.tsx         # Results page
│   │   ├── /api/
│   │   │   ├── parse-resume/route.ts
│   │   │   ├── parse-jd/route.ts
│   │   │   ├── analyze/route.ts
│   │   │   ├── tailor/route.ts
│   │   │   └── export-pdf/route.ts
│   │   └── /export/
│   │       └── page.tsx             # Export page
│   │
│   ├── /components/                 # React components
│   │   ├── /ui/                     # Shadcn UI primitives
│   │   ├── ResumeInput.tsx
│   │   ├── JDInput.tsx
│   │   ├── ScoreCard.tsx
│   │   ├── ScoreGauge.tsx
│   │   ├── GapAnalysis.tsx
│   │   ├── GapItem.tsx
│   │   ├── SideBySideDiff.tsx
│   │   ├── BulletItem.tsx
│   │   ├── JDSummaryCard.tsx
│   │   ├── ExportButton.tsx
│   │   └── FileUpload.tsx
│   │
│   ├── /lib/                        # Business logic
│   │   ├── /services/
│   │   │   ├── orchestrator.ts
│   │   │   ├── resume-parser.ts
│   │   │   ├── jd-parser.ts
│   │   │   ├── match-scorer.ts
│   │   │   ├── tailoring-service.ts
│   │   │   ├── gap-analysis.ts
│   │   │   ├── resume-assembler.ts
│   │   │   └── pdf-generator.ts
│   │   ├── /schemas/                # Zod schemas
│   │   ├── /llm/                    # LLM client & helpers
│   │   ├── /utils/                  # Utility functions
│   │   └── /db/                     # Database
│   │
│   ├── /hooks/                      # React hooks
│   ├── /types/                      # TypeScript type exports
│   └── /styles/
│       └── globals.css
│
├── /public/samples/                 # Sample resume + JD for demo
├── /tests/
│   ├── /unit/
│   ├── /integration/
│   └── /e2e/
└── /scripts/
    ├── seed.ts
    └── demo.ts
```

---

## 16. Glossary

| Term | Definition |
|---|---|
| **ATS** | Applicant Tracking System — software used by employers to parse and rank resumes |
| **Bullet** | A single line item within a work experience entry |
| **Confidence** | LLM self-assessment of rewrite accuracy (high/medium/low) |
| **Gap** | A skill, tool, or qualification present in the JD but missing from the resume |
| **JD** | Job Description — a written description of a specific job opening |
| **LLM** | Large Language Model (e.g., GPT-4) |
| **Match Score** | A 0–100 rating of resume-to-JD alignment |
| **Risk Flag** | Warning that a rewrite may overstate actual experience |
| **Side-by-Side Comparison** | Visual layout showing original vs tailored content |
| **Tailored Resume** | Resume rewritten to better match a specific JD |
| **Truthfulness Guardrail** | Mechanism preventing fabrication (prompt, validation, or check) |
| **Vertical Slice** | Complete end-to-end feature touching all stack layers |
| **Zod** | TypeScript-first schema validation library |

---

> **Document Maintainer:** Resume Shapeshifter Team
> **Review Cadence:** Update when architecture decisions change, new services are added, or data models evolve.
