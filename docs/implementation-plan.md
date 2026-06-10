# Resume Shapeshifter — Phase-wise Implementation Plan

**Version:** 1.0 | **Status:** Draft | **Last Updated:** June 9, 2026
**Total Estimated Effort:** 15–22 working days (54 tasks)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Phase Structure & Dependencies](#2-phase-structure--dependencies)
3. [Phase 1: Static Prototype (3–5 days)](#3-phase-1-static-prototype-3-5-days)
4. [Phase 2: LLM Integration (5–7 days)](#4-phase-2-llm-integration-5-7-days)
5. [Phase 3: PDF Export (3–4 days)](#5-phase-3-pdf-export-3-4-days)
6. [Phase 4: Validation & Guardrails (2–3 days)](#6-phase-4-validation--guardrails-2-3-days)
7. [Phase 5: Polish & Demo (2–3 days)](#7-phase-5-polish--demo-2-3-days)
8. [Risk Register](#8-risk-register)
9. [Acceptance Criteria Checklist](#9-acceptance-criteria-checklist)
10. [Appendix A: File Creation Order](#10-appendix-a-file-creation-order)
11. [Appendix B: Git Branch Strategy](#11-appendix-b-git-branch-strategy)

---

## 1. Overview

This document provides a granular, task-by-task implementation plan for the Resume Shapeshifter project, broken into 5 phases with 54 tasks total.

### 1.1 Effort Summary

| Phase | Tasks | Effort | Calendar Days |
|---|---|---|---|
| 1. Static Prototype | 12 tasks | 24–34h | 3–5 days |
| 2. LLM Integration | 14 tasks | 35–48h | 5–7 days |
| 3. PDF Export | 8 tasks | 20–28h | 3–4 days |
| 4. Validation & Guardrails | 10 tasks | 16–22h | 2–3 days |
| 5. Polish & Demo | 10 tasks | 16–22h | 2–3 days |
| **Total** | **54 tasks** | **111–154h** | **15–22 days** |

### 1.2 Key Milestones

```
M0 ─── Project scaffolded, dev environment ready
M1 ─── Static prototype with mock data (Phase 1 complete)
M2 ─── LLM-powered analysis and tailoring (Phase 2 complete)
M3 ─── PDF export working end-to-end (Phase 3 complete)
M4 ─── Truthfulness guardrails in place (Phase 4 complete)
M5 ─── Demo-ready, polished product (Phase 5 complete)
```

### 1.3 Phase Dependencies

```
Phase 1 ──► Phase 2 ──┬──► Phase 3 (PDF Export)
                       ├──► Phase 4 (Guardrails)
                       │
                       └──► Phase 5 (Polish) ── depends on all above
```

---

## 2. Phase Structure

Each task includes:
- **Task ID** — e.g., `P1.1`
- **Description** — What to build
- **Files** — Files to create/modify
- **Dependencies** — Tasks that must precede
- **Effort** — Estimated hours
- **Acceptance** — How to verify

---

## 3. Phase 1: Static Prototype (3–5 days)

**Goal:** Working UI with mock data, no LLM. All components render with hardcoded example data.

### Task P1.1: Initialize Next.js Project

| Field | Value |
|---|---|
| **Files** | `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `eslint.config.js`, `src/app/layout.tsx`, `src/styles/globals.css` |
| **Effort** | 2–3h |
| **Acceptance** | `npm run dev` starts; Shadcn UI components render |

**Steps:**
```bash
npx create-next-app@latest resume-shapeshifter --typescript --tailwind --eslint --app --src-dir
cd resume-shapeshifter
npx shadcn@latest init
npx shadcn@latest add button card badge tabs input textarea select separator
npm install zod react-hook-form @hookform/resolvers
npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test
```

### Task P1.2: Create Zod Schemas

| Field | Value |
|---|---|
| **Files** | `src/lib/schemas/resume.ts`, `src/lib/schemas/job-description.ts`, `src/lib/schemas/match-score.ts`, `src/lib/schemas/tailored-resume.ts`, `src/lib/schemas/gap-analysis.ts`, `src/lib/schemas/tailoring-run.ts`, `src/lib/schemas/index.ts`, `src/types/index.ts` |
| **Effort** | 2–3h |
| **Acceptance** | All schemas compile; sample objects pass `schema.parse()`; invalid objects fail |

**Schemas:** `ResumeProfile`, `JobDescriptionProfile`, `MatchScore` (0–100 with sub-scores), `TailoredBullet` (with metadata), `TailoredExperience`, `TailoredResume`, `ResumeGap`, `GapAnalysis`, `TailoringRun`

### Task P1.3: Create Mock Data

| Field | Value |
|---|---|
| **Files** | `src/lib/mock/sample-resume.json`, `src/lib/mock/sample-jd.json`, `src/lib/mock/mock-analysis-result.ts` |
| **Effort** | 1–2h |
| **Acceptance** | Mock data validates against Zod schemas; covers realistic scenarios |

### Task P1.4: Build Landing Page

| Field | Value |
|---|---|
| **Files** | `src/app/page.tsx`, `src/components/LandingPage.tsx`, `src/components/Header.tsx` |
| **Effort** | 2–3h |
| **Acceptance** | Hero + 3 feature cards + CTA button navigating to `/dashboard` |

### Task P1.5: Build Dashboard Layout

| Field | Value |
|---|---|
| **Files** | `src/app/dashboard/page.tsx` |
| **Effort** | 1–2h |
| **Acceptance** | Two input panels + "Analyze" button rendered |

### Task P1.6: Build ResumeInput Component

| Field | Value |
|---|---|
| **Files** | `src/components/ResumeInput.tsx`, `src/components/FileUpload.tsx` |
| **Effort** | 2–3h |
| **Acceptance** | Paste textarea + file upload stubs + character count |

### Task P1.7: Build JDInput Component

| Field | Value |
|---|---|
| **Files** | `src/components/JDInput.tsx` |
| **Effort** | 1–2h |
| **Acceptance** | Paste textarea with character count, minimum 50 chars validation |

### Task P1.8: Build ScoreCard Component

| Field | Value |
|---|---|
| **Files** | `src/components/ScoreCard.tsx`, `src/components/ScoreGauge.tsx` |
| **Effort** | 2–3h |
| **Acceptance** | SVG circular gauge (red/amber/green), sub-scores list, explanation text |

### Task P1.9: Build GapAnalysis Component

| Field | Value |
|---|---|
| **Files** | `src/components/GapAnalysis.tsx`, `src/components/GapItem.tsx` |
| **Effort** | 2–3h |
| **Acceptance** | Filterable gap list by importance; each gap shows name, badge, evidence, action |

### Task P1.10: Build JDSummaryCard Component

| Field | Value |
|---|---|
| **Files** | `src/components/JDSummaryCard.tsx` |
| **Effort** | 1–2h |
| **Acceptance** | Shows job title, company, skill tags, responsibilities, seniority badge |

### Task P1.11: Build SideBySideDiff Component

| Field | Value |
|---|---|
| **Files** | `src/components/SideBySideDiff.tsx`, `src/components/BulletItem.tsx` |
| **Effort** | 3–4h |
| **Acceptance** | Tabbed section navigation, original vs tailored columns, highlighted diffs, bullet metadata |

### Task P1.12: Build Results Page (Integration)

| Field | Value |
|---|---|
| **Files** | `src/app/dashboard/results/page.tsx`, `src/components/TailorButton.tsx`, `src/components/ExportButton.tsx` |
| **Effort** | 3–4h |
| **Acceptance** | Full results page with all components wired; Tailor/Export buttons show "Coming soon" |

**Phase 1 Gate:** `npm run dev` works; landing → dashboard → results navigation flows; all mock data renders.

---

## 4. Phase 2: LLM Integration (5–7 days)

**Goal:** Replace all mock data with real LLM-powered parsing, scoring, rewriting, and gap analysis.

### Task P2.1: Set Up Groq Client

| Field | Value |
|---|---|
| **Files** | `src/lib/llm/client.ts`, `src/lib/llm/prompt-runner.ts`, `src/lib/llm/cache.ts`, `.env.example` |
| **Effort** | 2–3h |
| **Acceptance** | Client makes requests with structured JSON output; handles errors/retries; caches responses |

**Key implementation:** Use Groq's `response_format: { type: 'json_object' }` and Zod `.parse()` for validation. Exponential backoff retry (1s, 2s, 4s, max 3).

### Task P2.2: Create JD Extraction Prompt

| Field | Value |
|---|---|
| **Files** | `prompts/jd-extraction.ts` |
| **Effort** | 1–2h |
| **Acceptance** | Output matches `JobDescriptionProfileSchema` for diverse JD formats |

### Task P2.3: Create Resume Parsing Prompt

| Field | Value |
|---|---|
| **Files** | `prompts/resume-parser.ts` |
| **Effort** | 1–2h |
| **Acceptance** | Output matches `ResumeProfileSchema` for varied resume formats |

### Task P2.4: Create Match Scoring Prompt

| Field | Value |
|---|---|
| **Files** | `prompts/match-scoring.ts` |
| **Effort** | 1–2h |
| **Acceptance** | Output matches `MatchScoreSchema`; scores are reasonable and explainable |

### Task P2.5: Create Bullet Rewriting Prompt

| Field | Value |
|---|---|
| **Files** | `prompts/bullet-rewriter.ts` |
| **Effort** | 2–3h |
| **Acceptance** | Output matches `TailoredBulletSchema`; rewrites preserve truthfulness with few-shot examples |

**Prompt rules:** Preserve meaning, use stronger action verbs, include JD terminology where truthful, preserve metrics, no fabricated content, flag uncertain changes as low confidence.

### Task P2.6: Create Summary Rewriting Prompt

| Field | Value |
|---|---|
| **Files** | `prompts/summary-rewriter.ts` |
| **Effort** | 1h |
| **Acceptance** | Rewritten summary is role-targeted but truthful |

### Task P2.7: Create Skill Reorderer Prompt

| Field | Value |
|---|---|
| **Files** | `prompts/skill-reorderer.ts` |
| **Effort** | 1h |
| **Acceptance** | Skills reordered by JD relevance; no new skills added |

### Task P2.8: Create Gap Analysis Prompt

| Field | Value |
|---|---|
| **Files** | `prompts/gap-analysis.ts` |
| **Effort** | 1–2h |
| **Acceptance** | Output matches `GapAnalysisSchema`; gaps are accurate and actionable |

### Task P2.9: Create Resume Assembler Prompt

| Field | Value |
|---|---|
| **Files** | `prompts/resume-assembler.ts` |
| **Effort** | 1h |
| **Acceptance** | Produces complete, coherent tailored resume |

### Task P2.10–P2.14: Build Services

| ID | File | Depends | Effort |
|---|---|---|---|
| P2.10 | `src/lib/services/resume-parser.ts` | P2.1, P2.3 | 2–3h |
| P2.11 | `src/lib/services/jd-parser.ts` | P2.1, P2.2 | 1–2h |
| P2.12 | `src/lib/services/match-scorer.ts` | P2.1, P2.4 | 1–2h |
| P2.13 | `src/lib/services/tailoring-service.ts` | P2.1, P2.5, P2.6, P2.7, P2.9 | 3–4h |
| P2.14 | `src/lib/services/gap-analysis.ts` | P2.1, P2.8 | 1–2h |

### Task P2.15: Build Orchestrator Service

| Field | Value |
|---|---|
| **Files** | `src/lib/services/orchestrator.ts` |
| **Depends** | P2.10–P2.14 |
| **Effort** | 3–4h |
| **Acceptance** | Runs full pipeline with parallelization; returns `TailoringRun` |

**Parallelization:**
- Step 1: Parse resume + JD in parallel
- Step 2: Score original + gap analysis in parallel
- Step 3: Tailoring (sequential)
- Step 4: Score tailored + gap analysis in parallel

### Task P2.16: Build API Routes

| Field | Value |
|---|---|
| **Files** | `src/app/api/parse-resume/route.ts`, `parse-jd/route.ts`, `analyze/route.ts`, `tailor/route.ts`, `export-pdf/route.ts` |
| **Depends** | P2.10–P2.15 |
| **Effort** | 3–4h |
| **Acceptance** | All 5 routes accept POST; return proper JSON/PDF; consistent error format |

### Task P2.17: Wire Frontend to API

| Field | Value |
|---|---|
| **Files** | `src/hooks/use-resume-parser.ts`, `use-jd-parser.ts`, `use-analyze.ts`, `use-tailor.ts` |
| **Depends** | P2.16, P1.12 |
| **Effort** | 3–4h |
| **Acceptance** | Real API calls replace mock data; loading/error states work |

**Phase 2 Gate:** Full end-to-end flow works with real LLM data.

---

## 5. Phase 3: PDF Export (3–4 days)

**Goal:** Generate and download tailored resume + side-by-side comparison PDFs.

### Task P3.1: Set Up Playwright

| Field | Value |
|---|---|
| **Files** | `src/lib/services/pdf-generator.ts`, `src/lib/pdf/templates.ts` |
| **Effort** | 2–3h |
| **Acceptance** | Playwright launches, renders HTML, saves as A4 PDF |

### Task P3.2: Create Tailored Resume Template

| Field | Value |
|---|---|
| **Files** | `src/lib/pdf/tailored-resume-template.ts` |
| **Effort** | 2–3h |
| **Acceptance** | ATS-friendly single-column layout with all resume sections |

### Task P3.3: Create Comparison PDF Template

| Field | Value |
|---|---|
| **Files** | `src/lib/pdf/comparison-template.ts` |
| **Effort** | 3–4h |
| **Acceptance** | Two-column: header + scores + JD summary + diff + gaps + disclaimer |

### Task P3.4: Complete Export PDF Route

| Field | Value |
|---|---|
| **Files** | Update `src/app/api/export-pdf/route.ts` |
| **Effort** | 2–3h |
| **Acceptance** | Returns PDF binary with correct Content-Type and Content-Disposition |

### Task P3.5: Build Export Page

| Field | Value |
|---|---|
| **Files** | `src/app/export/page.tsx` |
| **Effort** | 2–3h |
| **Acceptance** | Preview + two download buttons triggering PDF generation |

### Task P3.6: Wire Export Navigation

| Field | Value |
|---|---|
| **Files** | Update dashboard results page, ExportButton |
| **Effort** | 1–2h |
| **Acceptance** | "Export PDF" navigates to `/export` with all data via session/Zustand |

### Task P3.7: Handle Multi-Page Content

| Field | Value |
|---|---|
| **Files** | Update PDF templates with CSS page-break rules |
| **Effort** | 1–2h |
| **Acceptance** | 5+ page PDFs have proper page breaks; no text overflow |

### Task P3.8: Add PDF Caching

| Field | Value |
|---|---|
| **Files** | Update `src/lib/services/pdf-generator.ts` |
| **Effort** | 1h |
| **Acceptance** | Repeated identical requests return cached PDF |

**Phase 3 Gate:** Both PDF types generate and download correctly.

---

## 6. Phase 4: Validation & Guardrails (2–3 days)

**Goal:** Truthfulness enforcement, safety checks, user confirmation.

### Task P4.1: Build Truthfulness Checker

| Field | Value |
|---|---|
| **Files** | `src/lib/utils/truthfulness.ts` |
| **Effort** | 2–3h |
| **Acceptance** | Detects: new company names, new numbers, new tech not in original skills |

### Task P4.2: Confidence Flagging System

| Field | Value |
|---|---|
| **Files** | Update truthfulness.ts, BulletItem component |
| **Effort** | 1–2h |
| **Acceptance** | Low-confidence bullets show warning badge; riskFlag text displayed |

### Task P4.3: User Confirmation Flow

| Field | Value |
|---|---|
| **Files** | Update ExportButton, export page |
| **Effort** | 1–2h |
| **Acceptance** | Export disabled until scroll + checkboxes checked |

**Checkboxes:**
- [ ] I have reviewed all changes and confirm they are accurate
- [ ] I understand this tool does not guarantee ATS performance
- [ ] I will verify all low-confidence changes before submitting

### Task P4.4: Add UI Disclaimers

| Field | Value |
|---|---|
| **Files** | Update results page, export page |
| **Effort** | 1h |
| **Acceptance** | 4 disclaimers visible on results + export pages |

### Task P4.5: Add PDF Disclaimers

| Field | Value |
|---|---|
| **Files** | Update both PDF templates |
| **Effort** | 1h |
| **Acceptance** | PDF footer includes truthfulness disclaimer |

### Task P4.6: Build LLM Post-Validation

| Field | Value |
|---|---|
| **Files** | `src/lib/utils/llm-validator.ts` |
| **Effort** | 2–3h |
| **Acceptance** | Catches: score inconsistencies, date contradictions, keyword stuffing |

### Task P4.7: Input Validation

| Field | Value |
|---|---|
| **Files** | `src/lib/utils/input-validator.ts`, Update API routes |
| **Effort** | 1–2h |
| **Acceptance** | Empty/too-long/malformed inputs return 400 |

### Task P4.8: Rate Limiting

| Field | Value |
|---|---|
| **Files** | `src/lib/utils/rate-limiter.ts`, Update API routes |
| **Effort** | 1h |
| **Acceptance** | 10 req/min/session; returns 429 with Retry-After header |

### Task P4.9: Error Boundary & Toasts

| Field | Value |
|---|---|
| **Files** | `src/components/ErrorBoundary.tsx`, `src/components/Toast.tsx` |
| **Effort** | 1–2h |
| **Acceptance** | Component errors show friendly message; API errors show toast |

### Task P4.10: Logging

| Field | Value |
|---|---|
| **Files** | `src/lib/utils/logger.ts` |
| **Effort** | 1h |
| **Acceptance** | All API/LLM calls logged with timestamps; no sensitive data |

**Phase 4 Gate:** All guardrails active; export requires confirmation.

---

## 7. Phase 5: Polish & Demo (2–3 days)

### Task P5.1: Loading States & Skeletons

| Field | Value |
|---|---|
| **Files** | `src/components/Skeleton.tsx`, skeletons for ScoreCard, GapAnalysis, SideBySideDiff |
| **Effort** | 2–3h |
| **Acceptance** | Skeletons match layout; shimmer animation present |

### Task P5.2: Sample Demo Data

| Field | Value |
|---|---|
| **Files** | `public/samples/sample-resume.txt`, `public/samples/sample-jd.txt` |
| **Effort** | 1h |
| **Acceptance** | 3–5yr full-stack dev resume + Senior Frontend Engineer JD |

### Task P5.3: "Load Sample" Button

| Field | Value |
|---|---|
| **Files** | Update dashboard, ResumeInput, JDInput |
| **Effort** | 1h |
| **Acceptance** | One-click loads sample data into inputs |

### Task P5.4: Responsive Design

| Field | Value |
|---|---|
| **Effort** | 2–3h |
| **Acceptance** | Usable on 375px, 768px, 1440px |

### Task P5.5: Progress Steps

| Field | Value |
|---|---|
| **Files** | `src/components/ProgressSteps.tsx` |
| **Effort** | 1–2h |
| **Acceptance** | Input → Analysis → Tailor → Export indicator on all pages |

### Task P5.6: UX Improvements

| Field | Value |
|---|---|
| **Effort** | 1h |
| **Acceptance** | Ctrl+Enter triggers analyze; textareas auto-focus; Tab navigation works |

### Task P5.7: Performance Optimization

| Field | Value |
|---|---|
| **Effort** | 2–3h |
| **Acceptance** | React.memo on heavy components; lazy-load PDF lib; LLM cache active |

### Task P5.8: Test Suite

| Field | Value |
|---|---|
| **Files** | `tests/unit/schemas.test.ts`, `resume-parser.test.ts`, `match-scorer.test.ts`, `tailoring-service.test.ts`, `tests/integration/api-analyze.test.ts`, `tests/e2e/full-flow.spec.ts` |
| **Effort** | 3–4h |
| **Acceptance** | All tests pass; 80%+ unit coverage; E2E covers full flow |

### Task P5.9: Update README

| Field | Value |
|---|---|
| **Files** | `README.md` |
| **Effort** | 1–2h |
| **Acceptance** | Complete README with setup, demo walkthrough, deployment guide |

### Task P5.10: Final Demo Run

| Field | Value |
|---|---|
| **Effort** | 1–2h |
| **Acceptance** | All 10 acceptance criteria from ProblemStatement Section 12 verified |

**Phase 5 Gate:** `npm run build` succeeds; full demo flow works.

---

## 8. Risk Register

| # | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R1 | LLM hallucinates content | High | Critical | 4-layer guardrails: prompt + validation + post-processing + user confirmation |
| R2 | LLM costs exceed budget | Med | Med | Use llama-3.1-8b-instant for extraction; cache responses; limit retries |
| R3 | PDF fails in production | Med | High | Docker with Chromium; fallback PDF library |
| R4 | Vague JDs produce poor results | Med | Med | Detect and warn; allow editing parsed output |
| R5 | Multi-column PDF parsing fails | High | Low | Warn users; accept plain text as primary input |
| R6 | LLM response slow (>60s) | High | Med | Parallelize calls; show progress indicators |
| R7 | Vercel function timeout (10s/60s) | High | High | Use async processing; dedicated worker |
| R8 | Type complexity slows dev | Med | Med | Define types in Zod first; generate types from schemas |

---

## 9. Acceptance Criteria Checklist

### From ProblemStatement Section 12:

- [ ] AC1: Paste a resume
- [ ] AC2: Paste a job description
- [ ] AC3: Click "Analyze"
- [ ] AC4: See original match score
- [ ] AC5: See extracted JD requirements
- [ ] AC6: See missing/weak requirements
- [ ] AC7: Generate tailored resume
- [ ] AC8: Review original vs tailored side by side
- [ ] AC9: See tailored match score
- [ ] AC10: Export side-by-side PDF

### From ProblemStatement Section 19 (Definition of Done):

- [ ] PDF includes: original resume, tailored resume, original score, tailored score, JD summary, bullet rewrite explanations, gap analysis, truthfulness disclaimer
- [ ] Output polished enough to share as a portfolio project

---

## 10. Appendix A: File Creation Order (~84 files)

### Phase 1 (30 files)

P1.1: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `globals.css`, `layout.tsx`
P1.2: `src/lib/schemas/` (7 files) + `src/types/index.ts`
P1.3: `src/lib/mock/` (3 files)
P1.4: `src/app/page.tsx`, `LandingPage.tsx`, `Header.tsx`
P1.5: `src/app/dashboard/page.tsx`
P1.6: `ResumeInput.tsx`, `FileUpload.tsx`
P1.7: `JDInput.tsx`
P1.8: `ScoreCard.tsx`, `ScoreGauge.tsx`
P1.9: `GapAnalysis.tsx`, `GapItem.tsx`
P1.10: `JDSummaryCard.tsx`
P1.11: `SideBySideDiff.tsx`, `BulletItem.tsx`
P1.12: `results/page.tsx`, `TailorButton.tsx`, `ExportButton.tsx`

### Phase 2 (27 files)

P2.1: `src/lib/llm/client.ts`, `prompt-runner.ts`, `cache.ts`, `.env.example`
P2.2–P2.9: `prompts/` (8 prompt files)
P2.10–P2.14: `src/lib/services/` (5 service files)
P2.15: `orchestrator.ts`
P2.16: `src/app/api/*/route.ts` (5 route files)
P2.17: `src/hooks/` (4 hook files), updated pages

### Phase 3 (6 files)

P3.1: `pdf-generator.ts`, `templates.ts`
P3.2: `tailored-resume-template.ts`
P3.3: `comparison-template.ts`
P3.4: Updated `export-pdf/route.ts`
P3.5: `export/page.tsx`

### Phase 4 (7 files)

P4.1: `truthfulness.ts`
P4.6: `llm-validator.ts`
P4.7: `input-validator.ts`
P4.8: `rate-limiter.ts`
P4.9: `ErrorBoundary.tsx`, `Toast.tsx`
P4.10: `logger.ts`

### Phase 5 (14 files)

P5.1: `Skeleton.tsx` + 3 skeleton variants
P5.2: `public/samples/` (2 files)
P5.5: `ProgressSteps.tsx`
P5.8: `tests/` (6 test files)
P5.9: `README.md`

---

## 11. Appendix B: Git Branch Strategy

### Branches

```
main ─── Production-ready
  └── develop ─── Integration
       ├── feature/phase-1
       ├── feature/phase-2
       ├── feature/phase-3
       ├── feature/phase-4
       └── feature/phase-5
```

### Commit Format

```
<phase>/<task-id>: <description>
Example: P1.1: scaffold Next.js project with TypeScript and Tailwind
```

### Cadence

- Commit per completed task passing type check
- Merge to `develop` per completed phase
- Merge to `main` at project completion

---

> **Document Maintainer:** Resume Shapeshifter Team
> **Review Cadence:** Update when phase scope changes or estimates need adjustment.