# Phase 4: Validation & Guardrails — Edge Cases Reference

**Goal:** Truthfulness enforcement, safety checks, user confirmation flow.
**Tasks Covered:** P4.1 through P4.10

---

## 1. Truthfulness Checker (P4.1)

### Company Name Detection Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 1.1 | Company name has slight variation ("Google" vs "Google LLC" vs "Google Inc.") | Use fuzzy/partial matching; flag as potential mismatch if core name differs | Test: original has "Google", tailored has "Alphabet" — should flag |
| 1.2 | Company name in a different language or transliteration | Exact match comparison catches; fallback to case-insensitive comparison | Test: "Microsoft" vs "مايكروسوفت" — should NOT flag (different language) |
| 1.3 | Company name is a common word ("Apple", "Amazon") | Normal matching still works; no special handling needed | Test: original "Apple" stays "Apple" — no false positive |
| 1.4 | Internally transferred within the same company (both original and tailored have same company) | No flag — same company name | Test: original and tailored both have "Google" |
| 1.5 | Company name contains legal suffix changes ("Tech Corp" → "Tech Corporation") | Should not flag; these are the same entity | Add fuzzy matching for common suffixes |
| 1.6 | Starting a new job at a new company (legitimate resume update) | User added a new entry — this is valid, not a fabrication | Cannot detect intent; leave for user review |

### Metric/Number Detection Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 1.7 | Original has "increased revenue" — tailored has "increased revenue by 20%" | MUST flag: new number not in original | Test with explicit detection |
| 1.8 | Original has "20% improvement" — tailored has "improved by 20%" | Should NOT flag: same number, just rephrased | Test with number preservation |
| 1.9 | Original has "led a team" — tailored has "led a team of 12 engineers" | MUST flag: "12" is a new, unsupported metric | Test with invented team size |
| 1.10 | Original has "managed budget of $500K" — tailored has "managed $500K budget" | Should NOT flag: same number, different wording | Test with rephrased metric |
| 1.11 | Dates in tailored don't match original (e.g., changed duration) | MUST flag: date changes are factual fabrications | Test with altered dates |
| 1.12 | Percentage vs decimal ("50%" vs "0.5") | Should NOT flag if they represent the same value | Normalize before comparison |
| 1.13 | Numbers in URLs or version strings ("v2.0", "Node 18") | Should NOT flag version numbers or URLs | Use regex to exclude version patterns, URLs |
| 1.14 | Original has numerical skill levels ("React: 8/10") — tailored removes them | Should NOT flag: removal is fine | Test with skill ratings |

### Technology Detection Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 1.15 | Original has "JS" — tailored has "JavaScript" | Should NOT flag: same technology, different naming | Use both forms in skill list |
| 1.16 | Original has "React" — tailored adds "React Native" | SHOULD flag: React Native is a distinct technology not in original | Test with related but distinct tech |
| 1.17 | Original has "AWS" — tailored has "Amazon Web Services (AWS)" | Should NOT flag: same technology | Test with abbreviation expansion |
| 1.18 | Original has no skills section — tailored adds skill list based on experience | Tricky! If skills are inferred from experience bullets, may be acceptable; flag as medium confidence | Post-check: verify each tailored skill appears somewhere in original resume text |
| 1.19 | Technology name is generic ("Excel", "Word") — hard to distinguish from common words | Use a predefined tech dictionary for matching | Test with ambiguous terms |

### False Positive Mitigation

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 1.20 | Truthfulness checker has high false positive rate | Tune sensitivity; log all flags for developer review | Run checker on 10 known-good resumes + 10 intentionally bad |
| 1.21 | Checker flags content that user intentionally added (e.g., new certification they earned) | User may have legitimately updated resume; checker can't know intent | Always require user confirmation; never block the user |
| 1.22 | Checker misses a clear hallucination (false negative) | Improve detection patterns; add more checks | Run targeted adversarial tests |

---

## 2. Confidence Flagging System (P4.2)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 2.1 | All bullets are high confidence | No warnings shown; clean UI | Test with well-matched resume+JD |
| 2.2 | All bullets are low confidence | Show prominent banner: "All changes are low confidence. Manual review strongly recommended." | Test with poorly matched resume+JD |
| 2.3 | Mixed confidence levels (some high, some low) | Show warnings only on low-confidence items; summary count at top | Test with mixed confidences |
| 2.4 | Confidence is undefined/null (missing from LLM output) | Default to "low" (fail safe) | Mock missing confidence field |
| 2.5 | RiskFlag is empty string vs undefined | Both should hide risk flag UI | Test with both cases |
| 2.6 | RiskFlag text is very long (200+ chars) | Truncate with "Show more" option | Test with long risk message |
| 2.7 | Confidence flag color is not accessible (red on green, etc.) | Use patterns + icons in addition to color | Check WCAG compliance |

---

## 3. User Confirmation Flow (P4.3)

### Checkbox Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 3.1 | User checks only 2 of 3 confirmation checkboxes | Export button remains disabled | Click 2 checkboxes — verify button state |
| 3.2 | User checks all boxes, then unchecks one | Export button disables again | Select all, then deselect one |
| 3.3 | User checks boxes using keyboard (Spacebar) | Each checkbox should be independently toggled | Tab+Space through checkboxes |
| 3.4 | User checks boxes via screen reader | Checkboxes should have clear labels and `aria-label` | Test with NVDA/VoiceOver |
| 3.5 | Checkbox labels are not visible (using icon-only) | Labels should be visible text, not hidden | Visual inspection |
| 3.6 | User tabs to Export button while it's disabled | Focus should skip disabled button; or show tooltip why it's disabled | Tab through form elements |
| 3.7 | User scrolls down but hasn't seen all changes | Use IntersectionObserver to track scroll progress; require reaching bottom | Test with long content — scroll only halfway |
| 3.8 | User scrolls to bottom on desktop but content is short | Auto-mark "reviewed" if all content visible without scrolling | Test with short resume (no scrolling needed) |
| 3.9 | Form is submitted by pressing Enter on checkbox | Enter should toggle checkbox; not submit | Press Enter on focused checkbox |
| 3.10 | Session expires while user is reviewing changes | Show warning: "Your session has expired. Data may be lost." | Leave page idle for session TTL |

### UX Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 3.11 | User reviews changes on mobile (small screen) | Side-by-side stacks vertically; user must scroll longer | Test at 375px width |
| 3.12 | "Review all changes" takes too long for large resumes (>5 min) | Acceptable; quality over speed | Time the review process |
| 3.13 | User wants to export without reviewing (impatient user) | Must review; no skip option. Buttons remain disabled | The system enforces this |
| 3.14 | User opens multiple tabs for review | Each tab has its own confirmation state | Test with 2 tabs |

---

## 4. Disclaimers (P4.4, P4.5)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 4.1 | Disclaimers are not visible on small screens | Ensure they're visible at all viewport sizes; use responsive text | Test at 375px width |
| 4.2 | Disclaimers are dismissed by ad-blockers | Use generic class names (not "ad", "banner", "notice") | Test with uBlock Origin active |
| 4.3 | Disclaimers in PDF are not selectable/copyable | They're rendered as text; should be selectable | Try to select disclaimer text in PDF |
| 4.4 | Disclaimers in PDF disappear when printed | They should be part of the PDF content, not a separate overlay | Print PDF and verify |
| 4.5 | Disclaimers need to be translated to other languages | For MVP, English only; structure with i18n-ready class names | Acceptable for MVP |
| 4.6 | Screen reader users don't hear disclaimers | Use `role="alert"` or `aria-live="polite"` | Test with screen reader |

---

## 5. LLM Post-Validation (P4.6)

### Score Validation Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 5.1 | `overallScore` is not the weighted average of sub-scores | Flag if deviation > 10 points from expected weighted average | Mock score with 30-point deviation |
| 5.2 | `skillCoverageScore` is 100 but resume has no skills listed | Contradiction — must be impossible; flag hallucination | Test with empty skills + 100 skill score |
| 5.3 | `skillCoverageScore` is 0 but resume has all JD skills | Contradiction; likely parsing error | Test with perfect match + score of 0 |
| 5.4 | `seniorityScore` contradicts seniorityLevel (e.g., score 90 but level "entry") | Flag inconsistency | Test with mismatched seniority |
| 5.5 | All sub-scores are 0 but overallScore is 100 | Impossible; flag hallucination | Mock contradictory scores |
| 5.6 | Scores are integers but should be floats with one decimal | Acceptable; no precision requirement | Not an error |

### Content Consistency Validation

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 5.7 | Tailored resume claims "10 years experience" but original shows first job 2 years ago | Flag as unsupported seniority claim | Test with experience duration mismatch |
| 5.8 | Tailored resume adds a job entry not in original | MUST flag — critical truthfulness failure | Test with fabricated job entry |
| 5.9 | Tailored resume changes education degree type ("B.Tech" → "M.Tech") | MUST flag | Test with degree inflation |
| 5.10 | Tailored resume reorders experience chronologically (original was reverse-chronological) | Acceptable if order is consistent | Not an error |
| 5.11 | Original has "Familiar with Python" — tailored has "Expert in Python" | Flag: proficiency level escalated without support | Test with skill level inflation |
| 5.12 | Original has "Worked on a team" — tailored has "Led a team of 5" | Flag: leadership scope added without support | Test with leadership inflation |
| 5.13 | Tailored resume removes all metrics from original | Flag as warning: metrics removed; may reduce impact | Test with metric removal |

### Keyword Stuffing Detection

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 5.14 | JD keyword appears in every bullet of tailored resume | Flag as keyword stuffing if keyword density > 20% | Test with excessive keyword usage |
| 5.15 | JD keywords appear in unnatural phrases ("We used React React React...") | Flag as keyword stuffing | Test with repeated keywords |
| 5.16 | Keywords from different domains mixed (e.g., React + Excel in same bullet) | Flag as low-quality rewrite | Test with mixed-domain keywords |
| 5.17 | Number of keywords in tailored is > 200% of original | Flag heavy keyword increase | Test before/after keyword count |

---

## 6. Input Validation (P4.7)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 6.1 | XSS attempt: `<script>alert('xss')</script>` in resume text | Strip HTML tags; validate no script tags pass through | Send XSS payload in resume field |
| 6.2 | SQL injection attempt: `'; DROP TABLE users; --` | Text is not used in SQL queries directly (parameterized); but validate anyway | Send SQL injection string |
| 6.3 | Null byte injection: `\x00` in input | Strip null bytes; they can cause issues in C strings | Send null bytes in text |
| 6.4 | Extremely large Unicode characters (e.g., Zalgo text) | Normalize Unicode; limit UTF-8 byte length per character | Send Unicode stress test |
| 6.5 | Zero-width characters (used for invisible text) | Strip zero-width spaces, joiners | Send text with zero-width characters |
| 6.6 | Repeated special characters ("!!!!!!!!!!!!!!!!!!!!!!!!!!") | Preserve but flag as potential spam | Send text with excessive punctuation |
| 6.7 | Resume or JD contains only numbers | Valid but unusual; process normally | Send numeric-only input |
| 6.8 | Resume or JD contains binary data | Detect non-text content; return error: "Input must be text, not binary data" | Send null bytes + binary header |
| 6.9 | Text exceeds 50KB limit | Return 400: "Input exceeds maximum length of 50,000 characters" | Send 51KB of text |
| 6.10 | Text is exactly at the 50KB boundary | Process normally; should succeed | Send exactly 50,000 characters |

---

## 7. Rate Limiting (P4.8)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 7.1 | User exceeds 10 requests in 60 seconds | Return 429: "Too many requests. Please wait before trying again." | Fire 11 rapid requests |
| 7.2 | Rate limit header present in response | Include `Retry-After` and `X-RateLimit-*` headers | Check response headers |
| 7.3 | Rate limit counter resets correctly after window | 11th request after 60s should succeed | Fire 10 requests, wait 61s, fire 11th |
| 7.4 | Multiple users share same IP but different sessions | Rate limit per session (cookie-based), not per IP | Test from same IP with different sessions |
| 7.5 | Rate limiter memory leak (storing all past requests) | Clean old entries > window period | Send requests over 1 hour; check memory |
| 7.6 | User clears cookies — gets a new session with fresh rate limit | Acceptable; user loses previous session data | Clear cookies and retry |
| 7.7 | Rate limit counter is not thread-safe (race condition) | Use atomic operations or mutex for counter | Fire 10 concurrent requests |
| 7.8 | LLM API rate limit is hit before app rate limit | Handle separately (see Phase 2 edge cases) | App rate limit should be more restrictive |

---

## 8. Error Boundary & Toasts (P4.9)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 8.1 | Error boundary catches a rendering error in ScoreCard | Show fallback UI: "Something went wrong displaying the score. Please try refreshing." | Intentionally throw in ScoreCard render |
| 8.2 | Error boundary catches error in SideBySideDiff | Show fallback for that component only; other components unaffected | Throw in SideBySideDiff |
| 8.3 | Multiple errors occur simultaneously | Show multiple toasts; stack them vertically | Trigger 3 simultaneous errors |
| 8.4 | Toast is dismissed, then same error occurs again | Show toast again; don't suppress | Dismiss toast, trigger same error |
| 8.5 | Toast content is very long | Truncate toast message to 2 lines; full message in error boundary | Trigger error with long message |
| 8.6 | Toast accessibility: screen reader must announce | Use `role="alert"` or `aria-live="assertive"` | Test with screen reader |
| 8.7 | Error boundary in API hook vs component boundary | Separate boundaries for data fetching vs rendering | Test both scenarios |
| 8.8 | Error boundary resets its state on retry | Implement "Try again" button within error fallback | Click retry after error |
| 8.9 | Toast auto-dismisses too quickly (user can't read) | Auto-dismiss after 5s; manual dismiss always available | Test with long error message |
| 8.10 | Toast appears during loading state | Both can coexist; loading state is separate | Trigger error while loading |

---

## 9. Logging (P4.10)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 9.1 | Log contains PII (email, phone, resume content) | Sanitize: redact email patterns, phone numbers, API keys | Review log output after full pipeline run |
| 9.2 | Log file grows too large | Rotate logs; max 10MB per file; keep last 5 files | Generate heavy traffic |
| 9.3 | Log level is too verbose in production | Use `LOG_LEVEL=info` in production; `debug` in development | Check production log verbosity |
| 9.4 | Log function throws an error (circular reference in data) | Wrap logger in try-catch; never let logging crash the app | Log object with circular reference |
| 9.5 | LLM response (may contain PII) is logged | Never log full LLM response; log length, model, duration, success/failure only | Check log output |
| 9.6 | API key accidentally logged in error messages | Strip env var patterns from log messages | Review logs for key patterns |
| 9.7 | Timestamps are not in UTC | Use ISO 8601 UTC format for all logs | Verify timestamp format |
| 9.8 | Correlation ID not available for debugging | Generate request ID per API call; include in all logs | Send request and trace logs |

---

## 10. Testing Strategy for Phase 4 Edge Cases

### Unit Tests

```typescript
describe('Truthfulness Checker', () => {
  it('should detect new company names', () => { /* ... */ });
  it('should detect new numbers/metrics', () => { /* ... */ });
  it('should detect new technologies', () => { /* ... */ });
  it('should NOT flag legitimate rephrasing', () => { /* ... */ });
  it('should NOT flag abbreviation expansions', () => { /* ... */ });
  it('should NOT flag version numbers', () => { /* ... */ });
  it('should detect degree inflation (B.Tech → M.Tech)', () => { /* ... */ });
  it('should detect leadership scope inflation', () => { /* ... */ });
});

describe('LLM Validator', () => {
  it('should flag score inconsistencies', () => { /* ... */ });
  it('should flag contradictory content', () => { /* ... */ });
  it('should flag keyword stuffing', () => { /* ... */ });
  it('should pass consistent valid content', () => { /* ... */ });
});

describe('Input Validator', () => {
  it('should reject empty input', () => { /* ... */ });
  it('should reject oversized input', () => { /* ... */ });
  it('should sanitize XSS attempts', () => { /* ... */ });
  it('should strip null bytes', () => { /* ... */ });
});

describe('Rate Limiter', () => {
  it('should block after 10 requests', () => { /* ... */ });
  it('should reset after window expires', () => { /* ... */ });
  it('should have Retry-After header', () => { /* ... */ });
});

describe('Logger', () => {
  it('should not log PII', () => { /* ... */ });
  it('should not crash on circular references', () => { /* ... */ });
  it('should include timestamps', () => { /* ... */ });
});
```

### Integration Tests

```typescript
describe('Export confirmation flow', () => {
  it('should disable Export button without confirmation', () => { /* ... */ });
  it('should enable Export button with all confirmations', () => { /* ... */ });
  it('should show disclaimers on results page', () => { /* ... */ });
});
```

### Adversarial Test Cases

- [ ] Resume with fabricated metrics → system flags it
- [ ] Resume with fabricated company → system flags it
- [ ] Resume with skilled degree inflation → system flags it
- [ ] JD with zero overlap → gap analysis returns many gaps
- [ ] JD that is actually a poem/lyrics → detected as not a real JD
- [ ] XSS payload in resume text → sanitized before processing
- [ ] SQL injection in JD text → handled safely
- [ ] 50 rapid API requests → rate limited correctly

### Manual Test Checklist

- [ ] Truthfulness checker correctly identifies fabricated content
- [ ] Low-confidence bullets show warning badges
- [ ] Export button is disabled until all confirmations checked
- [ ] 4 disclaimers present on results and export pages
- [ ] PDF includes truthfulness disclaimer
- [ ] XSS attempts are sanitized
- [ ] Rate limiting blocks excessive requests
- [ ] Error boundary catches rendering errors gracefully
- [ ] Toasts show API errors with auto-dismiss
- [ ] Logs contain no PII
- [ ] `npx tsc --noEmit` passes
