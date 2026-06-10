# Phase 1: Static Prototype — Edge Cases Reference

**Goal:** Working UI with mock data, no LLM integration.
**Tasks Covered:** P1.1 through P1.12

---

## 1. Next.js Project Initialization (P1.1)

### Package & Dependency Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 1.1 | `create-next-app` fails due to existing directory | Show clear error; delete directory manually or use `--force` | Run `npx create-next-app` in a clean directory |
| 1.2 | Shadcn UI `init` fails (missing package manager, wrong Node version) | Check Node >= 18; ensure npm/pnpm/yarn is installed | Run `node --version` before init |
| 1.3 | Shadcn component add fails for specific component (e.g., `tabs` depends on `@radix-ui/react-tabs`) | Run `npx shadcn@latest add` individually for each component that fails | Check `components.json` for correct paths |
| 1.4 | `npm install` fails due to network/proxy issues | Use `npm install --prefer-offline` or switch registry to mirror | Run behind corporate VPN; test with `--registry=https://registry.npmmirror.com` |
| 1.5 | `zod` version mismatch with TypeScript strict mode | Pin `zod@3.23.x`; ensure `strict: true` in tsconfig | TypeScript compile check after install |
| 1.6 | `vitest` configuration fails path alias resolution | Configure `vitest.config.ts` with the same `paths` as `tsconfig.json` | Run a dummy test to verify imports |
| 1.7 | `@playwright/test` requires system dependencies (browser binaries) | Run `npx playwright install chromium`; fallback to `playwright install --with-deps` | Verify `playwright --version` works |

### TypeScript Configuration Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 1.8 | `tsconfig.json` path aliases (e.g., `@/`) don't match Next.js expectations | Next.js auto-configures path aliases; ensure `src/` prefix is correct | Import a file using `@/components/...` and verify resolution |
| 1.9 | `strict: true` causes existing Shadcn UI components to fail | Shadcn UI is designed for strict mode; if errors appear, update the component | Run `npx tsc --noEmit` after adding any Shadcn component |
| 1.10 | ESLint conflicts with Next.js default config | Next.js 14+ uses ESLint 9 flat config; ensure `.eslintrc.*` is not present | Run `npm run lint` and verify no conflicts |

---

## 2. Zod Schemas (P1.2)

### Schema Validation Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 2.1 | Resume has no contact info (null/undefined) | `contact` field optional; schema should not throw | `ResumeProfileSchema.parse({ skills: [], experience: [], education: [], projects: [], certifications: [] })` |
| 2.2 | Resume experience has empty bullets array | Valid — allow empty array; UI should handle gracefully | `experience: [{ company: "X", title: "Y", startDate: "2020", endDate: "2021", bullets: [] }]` |
| 2.3 | Match score is exactly 0 or exactly 100 | Both are valid boundary values; 0 means no match, 100 means perfect | `schema.parse({ overallScore: 0, ... })` and `schema.parse({ overallScore: 100, ... })` |
| 2.4 | Match score is a float (e.g., 87.5) | Should be allowed; use `z.number()` (not `z.int()`) | `schema.parse({ overallScore: 87.5, ... })` |
| 2.5 | JD seniority level is an unexpected value | `z.enum()` will throw; catch and default to null or return validation error | Try `seniorityLevel: "principal"` — should fail |
| 2.6 | Resume gap `importance` is uppercase ("HIGH" instead of "high") | Schema uses `z.enum(['high', 'medium', 'low'])`; will fail validation | Normalize to lowercase before parsing |
| 2.7 | Tailored bullet `confidence` is "medium" (correct) but contains trailing whitespace | `z.enum()` is strict; trim strings before parsing | Use `.transform(s => s.trim())` on string fields |
| 2.8 | Very long strings (>10KB) in any field | Schema should not have arbitrary length limits; but API routes should enforce max length | Test with 50KB resume text |
| 2.9 | Non-ASCII characters in resume (Unicode, emoji) | Zod handles UTF-8 fine; but ensure UI renders them correctly | Test with Hindi, Chinese, Arabic resume text |
| 2.10 | Circular JSON in mock data (e.g., self-referencing object) | Never pass circular JSON to Zod; validate during development | Add a JSON.stringify/parse round-trip test |

### Schema Cross-Validation Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 2.11 | `TailoredBulletSchema.original` must be non-empty | Use `z.string().min(1)` | Empty string should fail validation |
| 2.12 | MatchScore `explanation` must be at least 10 characters | Use `z.string().min(10)` | Short string "Good" should fail |
| 2.13 | `MatchScore.overallScore` is NaN | `z.number()` rejects NaN; ensure parser doesn't produce NaN | `schema.parse({ overallScore: NaN })` should throw |
| 2.14 | `ResumeGap.canSafelyAdd` is a string "true" instead of boolean true | `z.boolean()` rejects non-booleans; cast in JSON parsing | Test `canSafelyAdd: "true"` — should fail |

---

## 3. Mock Data (P1.3)

### Data Realism Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 3.1 | Mock resume has no experience section | Valid but should be flagged; scoring should still work | ResumeProfileSchema still passes; UI shows empty state |
| 3.2 | Mock JD is extremely short (one sentence) | Valid; but LLM (Phase 2) will produce low-confidence extractions | Test with JD: "Looking for a good React developer" |
| 3.3 | Mock resume has 20+ job entries | UI should handle long lists; scroll or collapse | Verify SideBySideDiff doesn't crash with long mock data |
| 3.4 | Mock data has dates in different formats ("Jan 2020", "01/2020", "2020-01") | All should be valid; store as-is, no date parsing needed for MVP | Verify UI displays all date formats |
| 3.5 | Mock resume has special characters in company names (e.g., "McDonald's", "AT&T") | JSON handles escaped quotes; ensure UI displays them | Test with: `"company": "McDonald's"` |
| 3.6 | Mock gap analysis has 0 gaps (perfect match) | Valid; UI should show empty state message: "No gaps found" | `gaps: []` should render empty state |
| 3.7 | Mock analysis result has mismatched types (e.g., overallScore is "85" string instead of 85 number) | Zod catches this; fix mock data immediately | Run `mockAnalysisResult` through all schemas during tests |
| 3.8 | Mock data file has trailing commas in JSON | JSON doesn't allow trailing commas; use .jsonc or remove | Validate with `JSON.parse()` during tests |

---

## 4. Landing Page (P1.4)

### UI/UX Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 4.1 | User navigates directly to `/dashboard` without seeing landing page | Works fine; landing page is informational only | Type URL directly in browser |
| 4.2 | Browser viewport is very narrow (<320px) | Layout should not break; text should wrap, button should stay visible | Test with Chrome DevTools at 320px width |
| 4.3 | Browser has reduced motion accessibility setting | Disable CSS animations and transitions | Use `@media (prefers-reduced-motion: reduce)` |
| 4.4 | Hero image (if any) doesn't load or is slow | Use a simple gradient/color background without external image dependencies | Turn off network and verify page renders |
| 4.5 | Feature cards have very long text (i18n future-proofing) | Cards should not overflow; use `text-wrap: balance` or fixed max-width | Inject long placeholder text |
| 4.6 | "Get Started" button is tapped rapidly multiple times | Button should debounce; no duplicate navigation | Click button rapidly 10 times — should navigate once |

---

## 5. Dashboard & Input Components (P1.5, P1.6, P1.7)

### ResumeInput Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 5.1 | User pastes nothing (empty textarea) | "Analyze" button disabled; show "Please paste your resume" message | Click Analyze with empty input |
| 5.2 | User pastes very short text (<50 characters) | Show validation: "Resume must be at least 50 characters" | Paste "Hello World" and try to analyze |
| 5.3 | User pastes extremely long text (>500KB) | Truncate at 50KB with warning; show character count | Paste 1MB of text and verify truncation |
| 5.4 | User uploads a non-PDF/DOCX file (.exe, .png) | Show error: "Unsupported file format. Please upload PDF, DOCX, or TXT." | Upload a .exe file and verify error |
| 5.5 | User uploads a very large PDF (>10MB) | Show error: "File too large. Maximum size is 10MB." | Upload 20MB PDF and verify error |
| 5.6 | User uploads a password-protected PDF | Show warning: "Cannot parse password-protected PDF. Please paste text instead." | Upload password-protected PDF |
| 5.7 | User uploads a scanned PDF (image-only, no text layer) | Show warning: "PDF appears to be scanned. Please paste text directly." | Upload scanned image PDF |
| 5.8 | User switches between paste and file upload multiple times | Both states should be independent; last action wins | Paste text, then upload file — file should replace text |
| 5.9 | User tabs into textarea and starts typing | Should work like a normal textarea; auto-grow height | Test keyboard navigation only (no mouse) |
| 5.10 | User pastes HTML-formatted text (copied from a webpage) | Accept but strip HTML tags; show cleaned plain text | Paste `<h1>Resume</h1><p>Experience</p>` — should show plain text |

### JDInput Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 5.11 | JD text is exactly 50 characters (boundary) | Should pass validation; "Analyze" should be enabled | Paste exactly 50 characters |
| 5.12 | JD contains only whitespace characters | Trim whitespace; if result is empty, show validation error | Paste "     " (spaces only) |
| 5.13 | JD has inconsistent line endings (CRLF vs LF) | Normalize to LF; no visual difference | Paste text with mixed line endings |
| 5.14 | User pastes JD with embedded URLs (e.g., "apply at https://...") | URLs are valid text; preserve as-is | Paste JD containing multiple links |

### Dashboard Layout Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 5.15 | Browser window is very wide (>2000px) | Inputs should have max-width; not stretch infinitely | Test at 2560px width |
| 5.16 | Browser window is resized during input | Layout should reflow smoothly; no jank | Resize from 1440px to 800px while typing |
| 5.17 | Both inputs are filled but user clicks "Analyze" before LLM integration (Phase 1) | Button should show "Coming Soon" tooltip or navigate to mock results | Click Analyze in Phase 1 prototype |
| 5.18 | Screen reader user navigates the dashboard | All inputs should have labels; error messages should be announced via `aria-live` | Test with NVDA or VoiceOver |

---

## 6. Results Page Components (P1.8–P1.12)

### ScoreCard & ScoreGauge Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 6.1 | Score is exactly 0 (worst match) | Gauge shows empty (red); text: "0% — No match detected" | Test with `overallScore: 0` |
| 6.2 | Score is exactly 100 (perfect match) | Gauge shows full (green); text: "100% — Perfect match" | Test with `overallScore: 100` |
| 6.3 | Score is a decimal (e.g., 85.3) | Gauge shows 85%; round to nearest integer for display | Test with `overallScore: 85.3` |
| 6.4 | Scores are identical before and after tailoring | Both gauges show same value; improvement delta shows 0 | Test with identical original and tailored scores |
| 6.5 | Explanation text is very long (>500 characters) | Text should scroll or be truncated with "Read more" | Provide a 1000-character explanation |
| 6.6 | Explanation text is empty string | Show "No explanation available" placeholder | Test with `explanation: ""` |
| 6.7 | Sub-scores array is missing some dimensions | Show "N/A" for missing sub-scores; don't crash | Omit `keywordScore` from the score object |
| 6.8 | Browser does not support SVG (very old browser) | Fall back to a numeric display; SVG is widely supported | Test in IE11 (if needed) |
| 6.9 | ScoreGauge animation is interrupted by component re-render | Use CSS transitions instead of JS animations; should be smooth | Rapidly update score prop |

### GapAnalysis Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 6.10 | Gap list is empty (no gaps) | Show: "No significant gaps detected. Your resume aligns well with this role." | Render with `gaps: []` |
| 6.11 | Gap list has 30+ items | Virtualize or collapse into accordion; default show top 5 | Render with 30+ gap items |
| 6.12 | All gaps have importance "low" | Filter defaults should still show all; "Show high only" button should show empty state | Test filter with no high-importance gaps |
| 6.13 | Gap name is very long (50+ characters) | Text should wrap; card should expand vertically | Use gap name: "Experience with distributed systems and microservices architecture patterns" |
| 6.14 | Suggested action contains a link (future feature) | For MVP, render as plain text; no link handling needed | Store action text with URLs but don't hyperlink |
| 6.15 | Importance filter is toggled rapidly | Filter should debounce; no stale render issues | Rapidly click filter buttons 10 times |
| 6.16 | Gap has empty jdEvidence or resumeEvidence | Show "No specific evidence extracted" placeholder | Test with empty evidence strings |

### JDSummaryCard Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 6.17 | Company name is null (not provided in JD) | Show "Company not specified" or hide company field | Test with `company: null` |
| 6.18 | JD has 50+ required skills | Show as a scrollable tag list; collapse after 10 with "Show all (+40)" | Render with 50 required skills |
| 6.19 | Seniority level is null | Show "Level not specified" badge | Test with `seniorityLevel: null` |
| 6.20 | Responsibilities list is empty | Show "No responsibilities extracted" message | Test with empty responsibilities array |

### SideBySideDiff & BulletItem Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 6.21 | No tailored data available yet (before tailoring) | Show placeholder: "Click 'Generate Tailored Resume' to see comparison" | Mount component without tailored prop |
| 6.22 | Original and tailored bullets are identical (no change needed) | Show both columns with same text; highlight as "No change needed" | Test with `original === tailored` |
| 6.23 | A company in tailored resume is not in original (should not happen, but guard) | Flag with warning badge: "⚠ Company not in original resume" | Pretend this scenario occurs |
| 6.24 | Tab switching between sections (Summary/Skills/Experience) causes flash | Use React state to cache rendered tabs; only switch content | Rapidly switch tabs 20 times |
| 6.25 | Experience section has 15+ entries | Only first 5 expanded by default; "Show all" button for rest | Test with 15+ experience entries |
| 6.26 | Bullet confidence is "low" | Show warning icon (orange triangle) next to the bullet | Test with `confidence: "low"` |
| 6.27 | Bullet has riskFlag set | Show red warning badge with riskFlag text; expandable | Test with `riskFlag: "This change may overstate leadership experience"` |
| 6.28 | Bullet changeReason is very long | Truncate to 2 lines with "Show more" expand | Test with 300-character change reason |
| 6.29 | Keywords addressed array is empty | Don't render keywords section for that bullet | Test with empty keywords array |
| 6.30 | User zooms browser to 200% | Layout should reflow; columns should not overlap | Test with browser zoom at 200% |

### Buttons & Actions Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 6.31 | "Tailor" button is clicked before "Analyze" completes | Button is disabled during analysis; show loading spinner | Click Tailor immediately on page load |
| 6.32 | "Export" button clicked before tailoring | Show: "Please generate the tailored resume first" | Click Export on blank results page |
| 6.33 | Buttons are clicked during loading state | All buttons should be disabled during API calls | Click Analyze, then immediately click Tailor |
| 6.34 | User navigates away from results page mid-analysis | No side effects; API call should be aborted if possible | Use AbortController in fetch calls |

---

## 7. Navigation & Routing Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 7.1 | User directly accesses `/dashboard/results` without going through `/dashboard` | Show error: "No analysis data found. Please submit your resume and JD first." | Type URL directly in browser |
| 7.2 | User directly accesses `/export` without any data | Redirect to `/dashboard` with message | Type URL directly in browser |
| 7.3 | Browser back button from results to dashboard | Data should be preserved (session storage); not lost | Navigate back and forth |
| 7.4 | User refreshes the results page | Data should be restored from session storage; not lost | Press F5 on results page |
| 7.5 | Next.js 404 page for unknown routes | Show a simple 404 page with link back to `/` | Navigate to `/nonexistent-page` |
| 7.6 | Hash fragments in URL (e.g., `/dashboard#resume-input`) | Should scroll to that section if element exists | Use hash links in navigation |

---

## 8. General Rendering & Browser Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 8.1 | JavaScript is disabled in the browser | Show minimal fallback: "This app requires JavaScript to function" | Test with JS disabled in DevTools |
| 8.2 | Third-party cookies blocked | Session cookies may not work; fallback to memory store with warning | Block third-party cookies in browser settings |
| 8.3 | Font fails to load (Google Fonts blocked) | Fallback to system font stack (Arial, sans-serif) | Block Google Fonts in DevTools |
| 8.4 | Browser is in dark mode | Ensure text contrast is sufficient; Tailwind dark mode support optional for MVP | Test with `prefers-color-scheme: dark` |
| 8.5 | Browser is in print mode | Print stylesheet should hide navigation, buttons, show only content | Use `@media print` in CSS |
| 8.6 | Very slow network | Loading states should show immediately; no stalled white screens | Throttle network to Slow 3G in DevTools |
| 8.7 | Offline mode | Fallback to cached page; show "You are offline" banner | Toggle offline in DevTools |
| 8.8 | Browser is a mobile device (Safari iOS, Chrome Android) | Touch targets should be minimum 44x44px; no horizontal scroll | Test on real mobile device or emulator |

---

## 9. Testing Strategy for Phase 1 Edge Cases

### Unit Tests to Write

```typescript
// Schema validation tests
describe('ResumeProfileSchema', () => {
  it('should accept a valid resume', () => { /* ... */ });
  it('should reject a resume with missing required fields', () => { /* ... */ });
  it('should accept a resume with no contact info', () => { /* ... */ });
  it('should accept a resume with empty experience array', () => { /* ... */ });
  it('should reject a resume with invalid enum value', () => { /* ... */ });
  it('should handle non-ASCII characters', () => { /* ... */ });
});

describe('MatchScoreSchema', () => {
  it('should accept score of 0', () => { /* ... */ });
  it('should accept score of 100', () => { /* ... */ });
  it('should accept decimal scores', () => { /* ... */ });
  it('should reject scores below 0', () => { /* ... */ });
  it('should reject scores above 100', () => { /* ... */ });
  it('should reject NaN', () => { /* ... */ });
});
```

### Component Tests to Write

```typescript
describe('ScoreGauge', () => {
  it('should render at score 0', () => { /* ... */ });
  it('should render at score 50', () => { /* ... */ });
  it('should render at score 100', () => { /* ... */ });
  it('should show correct color for score range', () => { /* ... */ });
});

describe('GapAnalysis', () => {
  it('should render empty state', () => { /* ... */ });
  it('should filter by importance', () => { /* ... */ });
  it('should handle very long gap lists', () => { /* ... */ });
});

describe('ResumeInput', () => {
  it('should validate minimum length', () => { /* ... */ });
  it('should handle file upload rejection', () => { /* ... */ });
  it('should handle paste events', () => { /* ... */ });
});
```

### Manual Test Checklist

- [ ] All schema validation tests pass
- [ ] Landing page renders at multiple viewport sizes
- [ ] Dashboard loads with both input components
- [ ] Input validation works (empty, too short, too long)
- [ ] File upload shows error for unsupported types
- [ ] Results page renders all components with mock data
- [ ] ScoreGauge shows correct colors for 0, 25, 50, 75, 100
- [ ] GapAnalysis filters correctly
- [ ] SideBySideDiff renders with tabs working
- [ ] Navigation between pages works (including direct URL access)
- [ ] Page refresh preserves data
- [ ] Console has no errors or warnings
- [ ] Accessibility check: all inputs have labels, focus visible
- [ ] Mobile responsive: test at 375px, 768px, 1440px
- [ ] `npx tsc --noEmit` passes with zero errors
