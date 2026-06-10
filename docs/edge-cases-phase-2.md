# Phase 2: LLM Integration — Edge Cases Reference

**Goal:** Replace all mock data with real LLM-powered parsing, scoring, rewriting, and gap analysis.
**Tasks Covered:** P2.1 through P2.17

---

## 1. OpenAI Client Setup (P2.1)

### API Key & Authentication Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 1.1 | `OPENAI_API_KEY` environment variable is not set | Client initialization throws clear error: "OpenAI API key not configured. Set OPENAI_API_KEY in .env.local" | Start server without env var |
| 1.2 | API key is invalid (malformed format) | OpenAI returns 401; retry should not happen; return error to user | Use key `sk-invalid123` |
| 1.3 | API key is expired or revoked | OpenAI returns 401 with "Incorrect API key provided" message | Use a known revoked key |
| 1.4 | API key has insufficient quota (billing exhausted) | OpenAI returns 429 with billing error; show user-friendly message | Use a key with $0 balance |
| 1.5 | API key is exposed to client-side bundle | Never expose; only use server-side; fail a test if `process.env.OPENAI_API_KEY` is referenced in client code | Add ESLint rule to prevent client-side API key usage |

### Rate Limiting & Throttling Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 1.6 | OpenAI rate limit hit (429) | Exponential backoff retry (1s, 2s, 4s); max 3 retries; then return error | Mock 429 responses in test |
| 1.7 | Rate limit exceeded repeatedly | After 3 failed retries, return: "Service temporarily unavailable. Please wait a moment and try again." | Mock 3 consecutive 429s |
| 1.8 | Rate limit headers (Retry-After) present in response | Parse Retry-After header; wait that duration before retry | Mock response with Retry-After: 10 |
| 1.9 | Concurrent requests hit rate limit simultaneously | Queue requests; don't exceed 3 concurrent LLM calls | Fire 10 parallel analyze requests |

### Response & Timeout Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 1.10 | LLM response timeout (>30s) | Abort request; return "Request timed out. Please try again." | Mock slow response (60s delay) |
| 1.11 | LLM returns empty content string | Throw error: "Empty response from AI. Please try again." | Mock response with empty content |
| 1.12 | LLM returns non-JSON content (plain text, markdown) | JSON.parse throws; retry with stricter instructions; if still fails, return parsing error | Mock response with text "I'm sorry, I cannot process this request" |
| 1.13 | LLM returns valid JSON but wrong shape (missing fields) | Zod safeParse catches missing fields; log error; return "AI returned incomplete data. Please try again." | Mock response missing `overallScore` field |
| 1.14 | LLM returns JSON with extra fields not in schema | Zod `.strip()` by default removes extras; no error (but log warning) | Mock response with extra `unexpectedField` |
| 1.15 | LLM returns JSON with null where array expected | Zod `.nullable()` catches null; default to empty array if possible | Mock response with `skills: null` |
| 1.16 | Network error (DNS failure, connection refused) | Return: "Network error. Check your internet connection." | Block OpenAI domain in firewall |
| 1.17 | LLM response is truncated mid-JSON | JSON.parse throws; retry once; if still fails, return error | Mock truncated response |

### Caching Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 1.18 | Cache key collision (two different prompts with same hash) | Extremely unlikely with SHA256; but use prompt + input concatenation as key | N/A — hash collision probability is negligible |
| 1.19 | Cache stores stale data | TTL of 1 hour; invalidate after expiry | Wait 1 hour and verify fresh API call |
| 1.20 | Cache grows too large (>100MB) | Implement LRU eviction; max 1000 entries | Fill cache with 1001 entries and verify eviction |
| 1.21 | Identical resume text submitted by different users | Cache from first user serves second user (acceptable for MVP, no PII in cache key) | Not a concern for session-based MVP |
| 1.22 | Cache persistence across server restarts | In-memory cache is lost on restart; acceptable for MVP | Restart dev server and verify cache cleared |

---

## 2. LLM Prompts (P2.2–P2.9)

### JD Extraction Prompt Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 2.1 | JD text is extremely short ("Hiring software engineer. Apply now.") | Return all fields with empty/limited data; low confidence flags | Test with one-sentence JD |
| 2.2 | JD text is extremely long (>10K tokens) | Truncate to fit token limit; warn user that some content was omitted | Test with 15K token JD |
| 2.3 | JD has no company name mentioned | Return `company: null` | Test with JD that omits company |
| 2.4 | JD mentions multiple company names (e.g., "work with Google, Facebook, Amazon") | Extract the hiring company if identifiable; otherwise return null | Test with consulting firm JD mentioning multiple clients |
| 2.5 | JD is in a non-English language (Hindi, Spanish, etc.) | Prompt should handle multi-language; extract in original language | Test with Hindi JD |
| 2.6 | JD is a mix of English and another language | Extract what can be extracted; flag low confidence | Test with bilingual JD |
| 2.7 | JD has no clear seniority level | Return `seniorityLevel: null` | Test with JD that says "looking for a developer" |
| 2.8 | JD has no clear skills section (narrative format) | Extract skills from context; may be less accurate | Test with narrative-style JD |
| 2.9 | JD has contradictory requirements (e.g., "entry level" + "5 years experience") | Note contradiction in explanation; likely a poorly written JD | Test with contradictory JD |
| 2.10 | JD uses abbreviations heavily (e.g., "JS", "TS", "FE") | Expand in keywords; preserve both abbreviation and full form | Test with abbreviation-heavy JD |
| 2.11 | JD is actually a cover letter or personal message | Detect and return warning: "This doesn't appear to be a job description" | Test with non-JD text |
| 2.12 | JD contains salary information | Should be extracted but stored separately (future use); not required for MVP | Test with JD including salary range |

### Resume Parsing Prompt Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 2.13 | Resume has non-standard section names ("Professional Journey" instead of "Experience") | Map to standard section names; flag in warnings | Test with creatively-named sections |
| 2.14 | Resume is in a single paragraph (no clear sections) | Parse as best as possible; all content goes into summary; low confidence | Test with paragraph-format resume |
| 2.15 | Resume has no contact information | Return empty contact object; don't fail | Test with resume missing email, phone, name |
| 2.16 | Resume has inconsistent date formats | Preserve as-is; no date parsing needed for MVP | Test with mixed date formats |
| 2.17 | Resume contains tables or columns | May parse poorly; warn user: "Table formatting detected. For best results, paste as plain text." | Test with multi-column resume |
| 2.18 | Resume contains hyperlinks (LinkedIn, portfolio) | Preserve as text; no clickable links in MVP | Test with resume containing URLs |
| 2.19 | Resume has no clear job titles | Use "Role not specified" as fallback | Test with resume missing titles |
| 2.20 | Resume has 10+ years of experience listed as one job entry | Parse as single entry; flag that it may span multiple roles | Test with long tenure at one company |
| 2.21 | Resume lists education before experience | Preserve original section order in parsed output | Test with education-first resume |
| 2.22 | Resume has repetitive bullet points across jobs | Preserve all bullets; don't deduplicate (that's the user's choice) | Test with similar bullets across entries |

### Match Scoring Prompt Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 2.23 | Resume and JD are from completely different fields (e.g., nurse applying for software engineer) | Score should be very low (<15); explanation should note mismatch | Test with nurse resume + SWE JD |
| 2.24 | Resume is already perfectly tailored to the JD (score 90+) | Score should be high; minimal rewrites needed | Test with well-matched resume + JD |
| 2.25 | JD has no required skills (all preferred) | Score based on preferred skills; explanation should note lack of required skills | Test with JD having empty requiredSkills |
| 2.26 | Resume has no skills section | Score 0 for skill coverage; lower overall score | Test with resume missing skills section |
| 2.27 | Resume has same skills but different terminology (e.g., "React.js" vs "React") | Semantic matching (LLM) should recognize they're the same | Test with terminology variations |
| 2.28 | Score explanation is contradictory (says "good match" but score is 20) | Zod validates score; but LLM may be inconsistent. Retry if score vs explanation mismatch > 30 points | Add cross-validation check in Phase 4 |
| 2.29 | Seniority level can't be determined from resume | Score seniority dimension as 0; explain in output | Test with resume missing seniority signals |

### Bullet Rewriting Prompt Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 2.30 | LLM adds unsupported metric (e.g., original says "improved performance" → tailored says "improved performance by 40%") | Critical truthfulness failure! Prompt should forbid this; post-processing should catch | Add test case specifically to detect hallucinated metrics |
| 2.31 | LLM adds a company name not in the original resume | Critical truthfulness failure! Prompt forbid; post-processing detect; block the rewrite | Add test case for hallucinated company |
| 2.32 | LLM invents a technology not in the original resume (e.g., "Used Kubernetes" when original resume never mentions it) | Critical truthfulness failure! Prompt should forbid; catch and flag | Add test case for hallucinated technology |
| 2.33 | Original bullet is very short ("Did coding") | LLM should expand using JD context but not invent specifics | Test with minimal bullets |
| 2.34 | Original bullet contains sensitive information (phone number, email) | Should not be rewritten; preserve as-is | Test with PII in bullet |
| 2.35 | All bullets are confidence "low" | Show warning: "All changes are low confidence. Consider manual review." | Test with poorly matched resume+JD |
| 2.36 | Bullet rewrite is identical to original | Set changeReason: "No change needed — already well-aligned" | Test with perfectly matched bullet |
| 2.37 | Bullet rewrite changes the meaning entirely | Prompt forbid; but if happens, low confidence flag | Manual review of rewrite outputs |
| 2.38 | Bullet contains quotes or special characters | Escape properly; preserve in output | Test with bullets containing double quotes, backslashes |
| 2.39 | Very large number of bullets to rewrite (30+) | May hit token limits; process in batches of 10 | Test with resume having 30+ bullets |

### Summary Rewriting Prompt Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 2.40 | Original has no summary (empty) | Generate a new summary based on resume content; flag as "generated" | Test with empty summary |
| 2.41 | Original summary is very long (>200 words) | Keep within resume-appropriate length (3-4 sentences) | Test with 500-word summary |
| 2.42 | LLM adds skills to summary that aren't in original resume | Catch in post-processing; flag as risk | Test for hallucinated skills in summary |

### Skill Reorderer Prompt Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 2.43 | No skills in the resume | Return empty array; don't invent skills | Test with resume missing skills section |
| 2.44 | Skills list is very long (50+) | Reorder all; emphasis on top 10 most relevant | Test with 50+ skills |
| 2.45 | LLM adds a skill not in the original list | Critical! Must not add new skills; only reorder | Catch in post-processing |
| 2.46 | All skills are equally relevant (or irrelevant) to JD | Maintain original order | Test with off-topic resume |

### Gap Analysis Prompt Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 2.47 | JD has a requirement that cannot be truthfully added (e.g., "PhD in Physics" when user has B.Tech) | Gap importance: high; suggestedAction: "Leave out if not true — prepare to discuss in interview" | Test with unrealistic JD requirement |
| 2.48 | JD has no clear requirements (vague job posting) | Return few or zero gaps; flag: "JD lacks specific requirements for detailed gap analysis" | Test with vague JD |
| 2.49 | Resume already covers all JD requirements | Return zero gaps; show: "No significant gaps detected." | Test with perfectly matching resume+JD |
| 2.50 | Gap count is very high (15+) | All gaps should be returned; UI should handle long lists | Test with completely unrelated resume+JD |
| 2.51 | A gap is suggested but resume actually does cover it (false positive) | LLM may miss some matches; flag as low confidence gap | Review gap analysis output manually |
| 2.52 | A gap importance is inconsistent (e.g., "TypeScript" flagged as low importance when it's required) | Retry with more explicit instructions; flag inconsistency | Test and review |

---

## 3. Services (P2.10–P2.15)

### Resume Parser Service Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 3.1 | LLM returns resume with no experience section | Parse successfully; empty experience array | Mock LLM response with no experience |
| 3.2 | LLM returns resume with duplicated entries | Don't deduplicate; preserve in output; flag in warnings | Mock duplicated entry response |
| 3.3 | Resume text is exactly 50 characters (minimum) | Parse normally; may have limited content | Test with 50-char resume |
| 3.4 | Resume parser is called with empty string | Return validation error before calling LLM: "Resume text is required" | Call parser with empty string |
| 3.5 | Resume parser is called concurrently with same input | Cache serves second call; no duplicate LLM calls | Fire two identical parse requests |

### JD Parser Service Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 3.6 | Well-formatted JD returns everything perfectly | Standard path; verify all fields populated | Test with realistic JD |
| 3.7 | JD parser called with null/undefined | Return validation error before LLM call | Call with `parseJd(null)` |
| 3.8 | JD text contains HTML tags (copied from web page) | Strip HTML before sending to LLM | Test with HTML-formatted JD |

### Match Scorer Service Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 3.9 | Score LLM call fails (network, timeout) | Return cached previous score if available; otherwise throw | Mock LLM failure and verify error handling |
| 3.10 | Both original and tailored score are requested simultaneously | Two independent LLM calls; should run in parallel | Trigger analyze + tailor simultaneously |
| 3.11 | Score is called with empty resume profile | Score should be 0; explanation: "Resume has no content to evaluate" | Call with empty profile object |

### Tailoring Service Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 3.12 | Bullet rewriting LLM call returns partial data (some bullets rewritten, some missing) | Retry for missing bullets; if still fails, use original bullets | Mock partial LLM response |
| 3.13 | Summary rewriting returns very long text (>500 chars) | Truncate to 500 chars; flag in warnings | Mock long summary output |
| 3.14 | One of the sub-calls (bullet, summary, skills) fails | Partial success is better than total failure; return what succeeded + warnings | Mock failure for skill reorderer only |
| 3.15 | Tailoring service called before resume is parsed | Should receive parsed Profile, not raw text; architectural design prevents this | TypeScript ensures correct types |
| 3.16 | Tailoring produces output that is identical to input (no changes) | Return as-is; explanation: "Resume already well-aligned with JD" | Test with perfectly matching resume+JD |

### Gap Analysis Service Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 3.17 | Gap analysis LLM fails | Return empty gaps + warning: "Gap analysis unavailable. Please try again." | Mock LLM failure for gap analysis |
| 3.18 | Gap analysis returns overlapping/duplicate gaps | Don't deduplicate; send to UI as-is (UI displays them) | Mock duplicate gaps |
| 3.19 | Gap analysis returns gap with importance outside enum | Zod validation catches; log error; skip that gap | Mock invalid importance value |

### Orchestrator Service Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 3.20 | Resume parser succeeds but JD parser fails | Return partial result: resume parsed, JD error; don't continue pipeline | Mock JD parser failure |
| 3.21 | All LLM calls fail | Return aggregated error: "Failed to analyze. All AI services unavailable. Please try again later." | Mock all LLM failures |
| 3.22 | One parallel branch fails (e.g., original scoring fails but gap analysis succeeds) | Return partial results; include error for failed branch | Mock scoring failure while gap succeeds |
| 3.23 | Orchestrator is called while previous run is still in progress | Queue or return cached previous run; don't start duplicate | Fire two identical analyze requests rapidly |
| 3.24 | Very large resume+JD causes total token usage to exceed context | Fail gracefully: "Input too large. Please shorten your resume or job description." | Test with 100K total characters |

---

## 4. API Routes (P2.16)

### Request Validation Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 4.1 | POST request with missing Content-Type header | Return 400: "Content-Type must be application/json" | Send POST without Content-Type |
| 4.2 | POST request with malformed JSON body | Return 400: "Invalid JSON in request body" | Send `{invalid json}` |
| 4.3 | POST request with extra unknown fields | Ignore extra fields; process known fields only | Send `{ resumeText: "...", jdText: "...", extraField: "..." }` |
| 4.4 | POST body is empty `{}` | Return 400: "Both resumeText and jdText are required" | Send `{}` |
| 4.5 | resumeText is provided but jdText is missing | Return 400: "jdText is required" | Send `{ resumeText: "..." }` |
| 4.6 | Both fields are empty strings | Return 400: "Both inputs must be at least 50 characters" | Send `{ resumeText: "", jdText: "" }` |
| 4.7 | Text fields contain only whitespace | Trim whitespace; treat as empty if result is empty | Send `{ resumeText: "   ", jdText: "   " }` |

### HTTP Method Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 4.8 | GET request to POST-only routes | Return 405: "Method Not Allowed" | Send GET to `/api/analyze` |
| 4.9 | PUT, PATCH, DELETE to any route | Return 405 or 404 | Send PUT to `/api/analyze` |
| 4.10 | OPTIONS preflight request (CORS) | Return 200 with appropriate CORS headers (if needed for cross-origin) | Browser automatically sends OPTIONS |
| 4.11 | HEAD request | Return headers only (same as GET but no body) | Send HEAD to `/api/analyze` |

### Response Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 4.12 | LLM call takes longer than Next.js API timeout (Vercel: 10s for Hobby, 60s for Pro) | This is a known risk; return partial results or timeout error | Trigger analyze with very long text |
| 4.13 | Response is very large (>5MB JSON) | Compress with gzip; Next.js handles this automatically | Analyze very large resume+JD |
| 4.14 | Response contains null bytes or non-printable characters | Strip before JSON serialization; return clean data | Mock LLM response with null bytes |
| 4.15 | Error response contains stack traces in production | Never expose stack traces in production; use generic error messages | Test with NODE_ENV=production |

---

## 5. Frontend Hooks & API Wiring (P2.17)

### Fetch & Data Loading Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 5.1 | API call is in flight and component unmounts | Abort fetch using AbortController; no setState on unmounted component | Navigate away during API call |
| 5.2 | API returns HTTP 500 | Show error toast: "Something went wrong. Please try again." | Mock 500 response |
| 5.3 | API returns unexpected response shape | Log error; show: "Received unexpected response from server." | Mock malformed response |
| 5.4 | Network is lost during API call | Show error: "Network error. Check your connection." | Disconnect network during call |
| 5.5 | User clicks "Analyze" twice rapidly | Debounce or disable button; prevent duplicate API calls | Double-click Analyze button |
| 5.6 | Loading state shows for longer than 30 seconds | Show timeout warning: "This is taking longer than expected. You may continue waiting or try again." | Mock long LLM response (60s) |
| 5.7 | User switches tabs (browser tab visibility) during API call | API call continues in background; no impact | Switch to another tab during loading |
| 5.8 | Multiple hooks fire simultaneously (analyze + tailor) | Each has its own loading state; independent | Click Analyze then immediately click Tailor |
| 5.9 | Hook state is reset mid-call | Previous call's response should be ignored if new call started | Trigger analyze, then quickly trigger another analyze |

### Data Flow Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 5.10 | Results page loaded from session storage with stale schema | Validate stored data against current schema; if invalid, clear and redirect to dashboard | Manually modify session storage with old data |
| 5.11 | Session storage is full (quota exceeded) | Store data in memory only; warn user about volatile storage | Fill localStorage to capacity |
| 5.12 | Session storage is disabled in browser | Fall back to memory-only storage; no persistence across refreshes | Disable cookies/localStorage in browser |
| 5.13 | Multiple tabs open, each with different analysis | Each tab has its own session; no cross-tab interference | Open two dashboard tabs, analyze different content |

---

## 6. General LLM Integration Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 6.1 | Total pipeline time exceeds 2 minutes | Acceptable for MVP; show progress indicator per step | Time full pipeline with realistic data |
| 6.2 | OpenAI API returns deprecated model warning | Update model selection; log warning for developer | Monitor API responses |
| 6.3 | LLM output contains profanity or harmful content | Prompt should specify professional tone; if occurs, flag for user review | Test with adversarial input (Phase 4) |
| 6.4 | LLM output contains PII (phone, email, SSN) from unintended memorization | Prompt should not leak; if detected, redact | Not testable directly — monitor production |
| 6.5 | User pastes AI-generated text as resume (ChatGPT output) | Parse as normal; no special handling (resume may be AI-generated, that's fine) | Test with AI-generated resume |

---

## 7. Testing Strategy for Phase 2 Edge Cases

### Unit Tests

```typescript
describe('LLM Client', () => {
  it('should handle empty API response', () => { /* ... */ });
  it('should retry on 429 status', () => { /* ... */ });
  it('should not retry on 400 status', () => { /* ... */ });
  it('should throw on invalid API key', () => { /* ... */ });
  it('should cache responses by hash', () => { /* ... */ });
  it('should evict cache when TTL expires', () => { /* ... */ });
});

describe('Orchestrator', () => {
  it('should parse resume and JD in parallel', () => { /* ... */ });
  it('should handle JD parser failure gracefully', () => { /* ... */ });
  it('should run scoring and gap analysis in parallel', () => { /* ... */ });
  it('should compile complete TailoringRun on success', () => { /* ... */ });
});

describe('Tailoring Service', () => {
  it('should not add unsupported metrics', () => { /* truthfulness check */ });
  it('should not add new employers', () => { /* truthfulness check */ });
  it('should not add new technologies', () => { /* truthfulness check */ });
  it('should preserve original dates and company names', () => { /* ... */ });
});
```

### Integration Tests

```typescript
describe('API: POST /api/analyze', () => {
  it('should return 400 for missing fields', () => { /* ... */ });
  it('should return 400 for empty text', () => { /* ... */ });
  it('should return 200 with valid TailoringRun', () => { /* ... */ });
  it('should return 405 for GET requests', () => { /* ... */ });
  it('should handle LLM timeout gracefully', () => { /* ... */ });
});
```

### Prompt Testing Checklist

- [ ] JD extraction: test with 1-sentence JD, 10-page JD, non-English JD, narrative JD
- [ ] Resume parsing: test with single-section resume, no-contact resume, non-English resume
- [ ] Match scoring: test with identical resume+JD, completely different fields, empty resume
- [ ] Bullet rewriting: test for truthfulness (must not add metrics, companies, technologies)
- [ ] Gap analysis: test with no-gap, full-gap, contradictory JD scenarios
- [ ] All prompts return valid JSON matching their Zod schema

### Manual Test Checklist

- [ ] Full pipeline runs with realistic resume+JD and returns results in < 120s
- [ ] All 5 API routes return correct responses
- [ ] Frontend shows loading states during API calls
- [ ] Error states display correctly (network error, server error, timeout)
- [ ] Caching reduces repeated LLM calls
- [ ] No API keys exposed in client-side code
- [ ] `npx tsc --noEmit` passes
- [ ] Console has no React errors or warnings
