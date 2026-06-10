# Phase 5: Polish & Demo — Edge Cases Reference

**Goal:** Production-ready demo with polished UI, sample data, and documentation.
**Tasks Covered:** P5.1 through P5.10

---

## 1. Loading States & Skeletons (P5.1)

### Skeleton Rendering Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 1.1 | Skeleton flashes for <100ms (fast API response) | Skeleton should have minimum display time or fade in after 200ms delay | Mock fast API response (50ms) |
| 1.2 | Skeleton shows for >30s (slow API) | Should continue showing; no timeout on skeleton itself | Mock very slow response |
| 1.3 | Multiple skeletons visible simultaneously (ScoreCard + GapAnalysis + SideBySideDiff) | Each skeleton should match its component's layout | Render results page with loading=true |
| 1.4 | Skeleton layout shifts when replaced with real content (CLS) | Skeleton dimensions should match actual component dimensions exactly | Measure CLS score in Lighthouse |
| 1.5 | Skeleton shimmer animation is CPU-intensive on low-end devices | Use CSS animation (not JS); reduce to simple opacity pulse if needed | Test on mid-range Android device |
| 1.6 | Screen reader announces skeleton content | Skeleton should have `aria-hidden="true"` | Test with NVDA |
| 1.7 | Skeleton disappears before data is ready (race condition) | Use loading state from React state, not derived | Test with rapid state changes |
| 1.8 | User prefers reduced motion (accessibility) | Disable shimmer animation; show static skeleton only | Use `prefers-reduced-motion: reduce` |
| 1.9 | Partial loading (some components loaded, some still loading) | Each component has its own loading state; mix of skeleton + content | Test analyze + tailor separately |

---

## 2. Sample Demo Data (P5.2)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 2.1 | Sample resume is too perfect (unrealistic match) | Should be realistic: ~50% match improving to ~75% | Review sample resume vs sample JD |
| 2.2 | Sample data becomes outdated (e.g., references old tech) | Update periodically; use evergreen technologies | Review quarterly |
| 2.3 | Sample data file is missing or corrupted | Show error: "Sample data unavailable. Please paste your own resume." | Delete sample files and test |
| 2.4 | Sample data contains unintentional copyrighted content | Use entirely original sample data; no real companies or people | Review content before shipping |
| 2.5 | Sample JD references a real company that may object | Use fictional company name or obfuscated details | Review and anonymize |
| 2.6 | Sample data is used in production (user relies on it) | Sample data is for demo only; encourage real use | Not an issue for MVP |

---

## 3. "Load Sample" Button (P5.3)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 3.1 | User clicks "Load Sample" while already having typed custom content | Overwrite warning? Auto-overwrite is acceptable for MVP | Click sample button after typing |
| 3.2 | User clicks "Load Sample" multiple times | Text should stay the same (idempotent) | Click sample button 5 times |
| 3.3 | User clicks both "Load Sample Resume" and "Load Sample JD" simultaneously | Both load correctly; no race condition | Click both at the same time |
| 3.4 | "Load Sample" buttons are confusing to distinguish from real submit | Clear labels: "Load Example Resume" vs "Paste Your Own" | User testing |
| 3.5 | Button loading state: sample data loads instantly (cached) | Should be instant; no loading state needed | Click sample button |
| 3.6 | Mobile: sample buttons take up too much space | Small text buttons or links, not large cards | Test at 375px width |

---

## 4. Responsive Design (P5.4)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 4.1 | Viewport width 320px (smallest common mobile) | No horizontal scroll; text reflows; buttons full-width | Test at 320px in DevTools |
| 4.2 | Viewport width 768px (tablet portrait) | Side-by-side inputs stack vertically; score cards side by side | Test at 768px |
| 4.3 | Viewport width 1024px (tablet landscape) | Full layout; comfortable spacing | Test at 1024px |
| 4.4 | Viewport width 2560px (large desktop) | Max content width 1280px; centered; whitespace on sides | Test at 2560px |
| 4.5 | Device pixel ratio 3x (Retina display) | Text should be crisp; use SVG for icons | Test on Mac Retina or iPhone |
| 4.6 | Browser zoom at 150% | Layout should reflow; no cutoff text | Zoom to 150% in browser |
| 4.7 | Browser zoom at 200% | Likely horizontal scroll; acceptable if text is still readable | Zoom to 200% |
| 4.8 | Orientation change (portrait ↔ landscape) on mobile | Layout transitions smoothly; no data loss | Rotate device during use |
| 4.9 | Foldable screen (Samsung Galaxy Fold) | Layout should adapt to unfolded width | Test on foldable emulator |
| 4.10 | iPad split-screen (1/3 + 2/3) | Layout works at 320px effective width | Use iPad split-screen |
| 4.11 | Side-by-side diff on mobile (375px) | Stacks vertically: original on top, tailored below | Test at mobile width |
| 4.12 | ScoreCard gauges on mobile | Gauges should be smaller; text remains readable | Mobile test |
| 4.13 | GapAnalysis importance badges on mobile | Badges should not wrap awkwardly | Mobile test |
| 4.14 | Export page PDF preview on mobile | Preview iframe should be scrollable; download buttons still visible | Mobile test |
| 4.15 | Checkbox labels for confirmation on mobile | Should not wrap mid-word; full label visible | Mobile test |

---

## 5. Progress Steps Indicator (P5.5)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 5.1 | User navigates directly to a future step (e.g., `/export` without analysis) | Redirect to appropriate step; show progress as incomplete | Direct URL access |
| 5.2 | Progress indicator shows all steps complete when some are skipped | Each step must be verified; don't mark incomplete steps as done | Navigate manually |
| 5.3 | Indicator has too many steps (>5) for mobile screen | Horizontal scroll or compact view; 4 steps should fit mobile | Test at 375px |
| 5.4 | Animation between steps is distracting | Use subtle color changes; no sliding/carousel | Visual inspection |
| 5.5 | User can click on progress steps to navigate between them | For MVP, steps are display-only; not clickable | Click on step label |
| 5.6 | Browser back button doesn't update progress indicator | Use useEffect + pathname to sync progress | Use browser back button |
| 5.7 | Progress step labels are not accessible | Use `aria-label` on each step | Screen reader test |

---

## 6. UX Improvements (P5.6)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 6.1 | Ctrl+Enter shortcut conflicts with browser shortcut | Ctrl+Enter typically submits forms; no conflict | Test in Chrome, Firefox, Safari, Edge |
| 6.2 | Cmd+Enter on macOS triggers shortcut | Should work alongside Ctrl+Enter | Test on macOS browser |
| 6.3 | Auto-focus on textarea causes page to scroll on load | Scroll to top if textarea is at the top; no aggressive scroll-jacking | Load dashboard page |
| 6.4 | Tab order doesn't match visual order | Ensure logical tab order: Resume → JD → Analyze | Tab through all elements |
| 6.5 | Focus indicator is not visible (keyboard users) | Use clear `:focus-visible` outline (not `outline: none`) | Tab through with keyboard |
| 6.6 | Cursor position lost when switching browser tabs | Browser preserves cursor; no issue | Switch tabs and return |
| 6.7 | Textarea doesn't show cursor on mobile | iOS Safari may hide cursor in certain conditions | Test on real iOS device |
| 6.8 | Shortcut key causes unintended action when typing in other fields | Scope shortcut to only trigger when textarea is focused | Press Ctrl+Enter while focused on URL bar |
| 6.9 | Multiple shortcut keys conflict with each other | Only one primary shortcut (Ctrl+Enter); no conflicts | Not a concern |
| 6.10 | Keyboard shortcut is not discoverable | Show tooltip: "Press Ctrl+Enter to analyze" | Hover over Analyze button |

---

## 7. Performance Optimization (P5.7)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 7.1 | Large resume (50KB) causes slow rendering in SideBySideDiff | Virtualize bullet list if > 50 items; lazy load full content | Test with 50KB resume |
| 7.2 | React.memo fails to prevent re-render (props change every render) | Deep compare props or use stable references | Profile with React DevTools |
| 7.3 | Lazy-loading PDF library still loads on initial page load | Verify with Network tab; PDF imports should only load on `/export` | Monitor network for pdf.js |
| 7.4 | Memory leak from unsubscribed observers (IntersectionObserver for scroll) | Use useEffect cleanup to disconnect observers | Navigate away and check memory |
| 7.5 | Large batch of LLM cache entries causes memory pressure | LRU eviction; max 1000 entries | Generate 2000 cache entries |
| 7.6 | Image assets (if any) are not optimized | Use SVGs or inline base64 for small icons; no large images | Audit with Lighthouse |
| 7.7 | Third-party scripts slow down initial load | No third-party scripts for MVP | Lighthouse audit |
| 7.8 | CSS bundle is too large | Purge unused Tailwind classes | Check build output size |
| 7.9 | JS bundle is too large | Use Next.js dynamic imports for heavy components | Run `next build` and check `.next/static` |
| 7.10 | First Input Delay (FID) is high | Avoid heavy JS on main thread; defer non-critical work | Lighthouse audit |
| 7.11 | Largest Contentful Paint (LCP) is slow | Optimize above-fold content; lazy load below-fold | Lighthouse audit |
| 7.12 | Cumulative Layout Shift (CLS) from dynamic content | Reserve space for dynamic content (skeleton approach) | Lighthouse audit |

---

## 8. Test Suite (P5.8)

### Unit Test Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 8.1 | Test produces false positive (passes when it should fail) | Write negative tests: assert invalid inputs cause failures | Code review tests |
| 8.2 | Test produces false negative (fails when it should pass) | Verify test logic matches expected behavior | Code review tests |
| 8.3 | Tests depend on external API (OpenAI, network) | Mock all external calls; never hit real API in tests | Check test environment |
| 8.4 | Tests are flaky (sometimes pass, sometimes fail) | Remove time-dependent assertions; use deterministic mocks | Run test suite 10 times |
| 8.5 | Test suite takes too long (>5 min) | Split into unit (fast) and integration (slow); run unit on every commit | Time the test suite |
| 8.6 | Tests fail due to timezone differences | Use UTC for all date/time in tests | Run in different TZ |
| 8.7 | Schema tests don't cover all fields | Use exhaustive validation with schema's shape | Generate test cases from Zod schema |
| 8.8 | Mock data for tests is stale (doesn't match current schema) | Validate mock data against schema in a setup hook | Run test after schema changes |

### E2E Test Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 8.9 | E2E test runs against real API (costly, slow) | Mock API responses in E2E tests | Use MSW (Mock Service Worker) |
| 8.10 | Playwright E2E tests fail in CI (no GPU, no display) | Use `--headless` mode; install system deps | Run in GitHub Actions |
| 8.11 | E2E test times out waiting for a slow API response | Increase timeout for E2E tests; use longer default timeout | Configure playwright.config.ts |
| 8.12 | Test isolation: one test leaves state that affects another | Clear state between tests (session storage, cookies) | Use `test.describe.serial` or reset per test |
| 8.13 | Visual regression tests fail due to pixel differences | Use threshold-based comparison (not exact pixel match) | Configure snapshot thresholds |
| 8.14 | E2E test for PDF download can't inspect PDF content | Verify Content-Type and Content-Disposition headers; optionally parse PDF | Use pdf-parse for validation |

---

## 9. README Documentation (P5.9)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 9.1 | README instructions are out of date after code changes | Review README after each phase; update as needed | Phase gate checklist includes README review |
| 9.2 | Setup steps are incomplete (missing dependency) | Follow setup from a clean environment; verify each step | Fresh clone + setup test |
| 9.3 | Screenshots in README are outdated | Use text-based diagrams or links to live demo | Mark screenshots with version |
| 9.4 | README links to non-existent sections | Check all internal and external links | Manual link audit |
| 9.5 | README doesn't include troubleshooting section | Add common issues: API key setup, Playwright installation, port conflicts | Collect issues during development |
| 9.6 | README is not accessible (poor formatting, small font) | Use proper markdown; GitHub renders it well | Visual inspection |

---

## 10. Final Demo Run (P5.10)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 10.1 | Demo shows improvement from ~50% to ~75% match (expected) | Should show clear, non-trivial improvement | Run demo with sample data |
| 10.2 | Demo completes in < 60 seconds (acceptable for presentation) | Pre-warm cache for demo; or run analyze before presenting | Time the demo flow |
| 10.3 | Demo network fails (no internet) | Pre-load all data; or have offline fallback | Disconnect network during demo |
| 10.4 | Demo looks unprofessional (typos, broken layout) | Rehearse demo; fix any visual issues before final | Full dress rehearsal |
| 10.5 | Demo produces PDF that doesn't show improvement clearly | Compare original and tailored PDF side by side | Review PDF output |
| 10.6 | Demo sample resume has errors or unrealistic content | Review sample data carefully | Peer review sample data |
| 10.7 | Live demo API key hits rate limit during presentation | Have backup key; or pre-cache all LLM calls | Prepare for worst case |
| 10.8 | Demo environment differs from development (different Node version, OS) | Use Docker for consistent demo environment | Test demo in target environment |
| 10.9 | Demo screen resolution differs (projector 1920x1080 vs laptop) | Test at common projector resolutions | Test at 1920x1080 |
| 10.10 | Demo needs to be restarted mid-presentation | Quick restart: clear session, load sample data in 2 clicks | Practice restart |

### Full Acceptance Criteria Verification

Run through all 10 criteria from ProblemStatement Section 12:

- [ ] AC1: Paste a resume ✓
- [ ] AC2: Paste a job description ✓
- [ ] AC3: Click analyze ✓
- [ ] AC4: See original match score ✓
- [ ] AC5: See extracted JD requirements ✓
- [ ] AC6: See missing/weak requirements ✓
- [ ] AC7: Generate tailored resume ✓
- [ ] AC8: Review original vs tailored side by side ✓
- [ ] AC9: See tailored match score ✓
- [ ] AC10: Export side-by-side PDF ✓

---

## 11. General Production-Readiness Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 11.1 | `npm run build` fails | Fix all build errors before considering Phase 5 complete | Run build after every change |
| 11.2 | `npm run dev` shows warnings | Fix warnings (not errors); they indicate potential issues | Monitor dev server output |
| 11.3 | Production environment has different Node version | Use `.nvmrc` or `engines` in package.json; pin Node 18+ | Test on Node 18, 20, 22 |
| 11.4 | Environment variables missing in production | App should crash early with clear error message | Remove env var in production test |
| 11.5 | Console errors from React (unnecessary re-renders, missing keys) | Fix all React console errors/warnings | Check console after full flow |
| 11.6 | Memory usage grows over time (leak) | Monitor memory after 10+ full pipeline runs | Heap snapshot comparison |
| 11.7 | App crashes on unhandled promise rejection | Add global `unhandledrejection` handler | Trigger failed promise |
| 11.8 | App crashes on uncaught exception | Add global `error` event handler | Trigger uncaught error |

---

## 12. Testing Strategy for Phase 5 Edge Cases

### Tests to Write

```typescript
describe('Responsive Layout', () => {
  it('should render at 320px without horizontal scroll', () => { /* ... */ });
  it('should render at 768px with tablet layout', () => { /* ... */ });
  it('should render at 1440px with desktop layout', () => { /* ... */ });
  it('should handle orientation change', () => { /* ... */ });
});

describe('ProgressSteps', () => {
  it('should show correct step for dashboard', () => { /* ... */ });
  it('should show correct step for results', () => { /* ... */ });
  it('should show correct step for export', () => { /* ... */ });
  it('should redirect when accessing future step', () => { /* ... */ });
});

describe('Skeleton Loading', () => {
  it('should not cause layout shift', () => { /* ... */ });
  it('should be aria-hidden', () => { /* ... */ });
  it('should fade in after 200ms delay', () => { /* ... */ });
});
```

### Lighthouse Audit Targets

| Metric | Target |
|---|---|
| Performance | > 80 |
| Accessibility | > 90 |
| Best Practices | > 90 |
| SEO | > 90 |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| First Input Delay | < 100ms |

### Final Demo Checklist

- [ ] Full E2E flow works (paste → analyze → tailor → export)
- [ ] Sample data loads with one click on each button
- [ ] Match score shows improvement (original ~50% → tailored ~75%)
- [ ] Gap analysis shows actionable items
- [ ] Side-by-side diff shows clear changes with explanations
- [ ] Both PDFs download and look professional
- [ ] Confirmation checkboxes prevent accidental export
- [ ] Disclaimers visible throughout
- [ ] Responsive: works on mobile, tablet, desktop
- [ ] Lighthouse scores meet targets
- [ ] `npm run build` succeeds with no errors
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Console has no errors or warnings
- [ ] Demo can be presented within 5 minutes
