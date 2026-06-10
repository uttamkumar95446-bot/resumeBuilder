# Phase 3: PDF Export — Edge Cases Reference

**Goal:** Generate and download tailored resume + side-by-side comparison PDFs.
**Tasks Covered:** P3.1 through P3.8

---

## 1. Playwright Setup & PDF Generation (P3.1)

### Chromium/Browser Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 1.1 | Chromium not installed (Playwright not initialized) | Error: "Playwright browsers not found. Run `npx playwright install chromium`" | Delete browser cache and start server |
| 1.2 | Chromium version mismatch with installed Playwright | Reinstall: `npx playwright install --force chromium` | Manual version check |
| 1.3 | Chromium cannot launch in server environment (missing system deps) | Error: "System dependencies missing. Run `npx playwright install-deps chromium`" | Run in minimal Docker container |
| 1.4 | Playwright launch timeout (browser hangs) | Set timeout: 30s; if exceeded, throw launch error | Mock slow system |
| 1.5 | Multiple concurrent PDF requests attempt to use the same browser instance | Use browser pool or launch per request; close after each | Fire 10 simultaneous export requests |
| 1.6 | Memory leak from repeated browser launch/close | Log memory usage; restart server if > 500MB | Send 100 sequential export requests |
| 1.7 | Docker container has no `/tmp` write access (Playwright needs temp directory) | Set `PLAYWRIGHT_BROWSERS_PATH` to writable directory | Run in restricted Docker container |
| 1.8 | Render fails due to missing fonts in headless mode | Embed fonts as base64 in HTML; fallback to system fonts | Test without Arial/Helvetica installed |

### PDF Rendering Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 1.9 | HTML template has invalid HTML (unclosed tags, mismatched nesting) | Browser renders it generously (parses errors); but validate HTML before sending | Test with intentionally broken HTML |
| 1.10 | CSS print rules (`@page`, `page-break-*`) not respected | Verify CSS in Chrome DevTools Rendering tab | Print preview and verify page breaks |
| 1.11 | PDF generation exceeds available memory | Stream to disk instead of holding buffer in memory | Test with 50+ page resume |
| 1.12 | PDF generation takes too long (>30s for simple resumes) | Set timeout; return error if exceeded | Profile with large content |
| 1.13 | Playwright `page.pdf()` throws due to restricted CSP | Relax CSP for PDF generation route only | Test with strict CSP headers |

---

## 2. Tailored Resume PDF Template (P3.2)

### Content Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 2.1 | Resume has no contact information | Show name field as empty; hide email/phone sections if missing | Test with resume missing all contact fields |
| 2.2 | Resume has extremely long summary (>500 chars) | Font size adjusts or summary wraps to multiple lines; page break if needed | Test with 1000-char summary |
| 2.3 | Resume has 50+ skills | Render in 3 columns; wrap to next page if needed | Test with 50+ skills list |
| 2.4 | Resume has 20+ job entries | Each entry should be compact; 2 lines per bullet max | Test with long job history |
| 2.5 | Skills list is empty | Omit skills section entirely from PDF | Test with empty skills |
| 2.6 | Bullet text is very long (>300 chars) | Font size 10pt; text wraps; bullets should be 1-2 lines max | Test with 400-char bullet |
| 2.7 | Company name or job title is very long | Text wraps; don't truncate | Test with company: "Very Long Corporation Name LLC and Partners" |
| 2.8 | Education section has multiple degrees (PhD, Masters, Bachelors) | Render in reverse chronological order | Test with 3+ education entries |
| 2.9 | Certifications list is very long | Compact list; single column with bullet items | Test with 15+ certifications |
| 2.10 | Resume has both projects and experience sections | Experience first, then projects; ensure clear visual separation | Test with both sections populated |
| 2.11 | Content contains emoji (😊 🚀 💻) | Embed emoji font or use system emoji; ensure PDF renders them | Test with emoji in summary and bullets |
| 2.12 | Content contains special characters (©, ®, ™, —, ·) | Use HTML entities (`&copy;`, `&mdash;`) or UTF-8 encoding | Test with special characters throughout |

### Layout & Formatting Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 2.13 | Content is too short (one paragraph) | Center vertically on page; or just render normal | Test with very short resume |
| 2.14 | Content spans exactly one page (boundary) | Should fit on one page without overflow to second | Test with content tailored to exactly one page |
| 2.15 | Section header is at the very bottom of a page (orphan) | Use `page-break-inside: avoid` on sections; move section to next page | Test with section starting at page bottom |
| 2.16 | Single bullet wraps across page break | Use `page-break-inside: avoid` on individual bullets | Test with bullet at page boundary |
| 2.17 | Left/right margins are different due to printer settings | Set explicit margins in `page.pdf()`: `{ margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' } }` | Inline style should enforce |
| 2.18 | Line height is too tight or too loose | Set `line-height: 1.4` for body text; test with long paragraphs | Visual inspection |
| 2.19 | Font sizes are inconsistent across sections | Define CSS variables: `--h1-size: 18pt`, `--body-size: 11pt` | Verify all headings and body |

---

## 3. Comparison PDF Template (P3.3)

### Side-by-Side Layout Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 3.1 | Original resume has 10 bullets but tailored has 12 (some bullets split) | Left column shows empty space where right has extra; or align by index | Test with mismatched bullet counts |
| 3.2 | Original resume has 3 job entries but tailored has 4 (should never happen) | Should not happen; if occurs, flag as truthfulness error | Ensure orchestration prevents this |
| 3.3 | Column widths are unequal due to very different content lengths | Set equal width columns (48% each, 4% gap); don't auto-size | Test with one column very long, other very short |
| 3.4 | Two-column layout doesn't fit on mobile PDF viewer | Landscape orientation may help; or default to portrait with narrow columns | Test with Adobe Acrobat mobile |
| 3.5 | Headers (company name, job title) span across both columns | Use single-row header spanning full width | Verify header alignment |
| 3.6 | Score gauges in PDF don't match web version | Re-render SVG gauges as static images or CSS-only | Compare PDF with web version |
| 3.7 | JD summary section is too wide for PDF page | Compact layout: skills as inline tags, responsibilities as condensed list | Test with long JD summary |
| 3.8 | Gap analysis table has very long text in cells | Text wraps within cells; ensure word-break is enabled | Test with 200-char gap evidence text |
| 3.9 | Gap analysis has 20+ gaps | Table rows continue to second page; header row should repeat | Use `<thead>` with `<th>` for repeating headers |

### Highlighting Changed Bullets

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 3.10 | Highlighted changed bullets have poor contrast (light green on white) | Use light green `#E8F5E9` background; ensure text is still readable | Check WCAG contrast ratio > 3:1 for highlights |
| 3.11 | All bullets are highlighted (completely different resume) | Visual overload; consider showing "major rewrite" badge instead of highlighting every bullet | Test with 100% rewritten resume |
| 3.12 | Highlighting doesn't print (browser print ignores background colors) | Use `-webkit-print-color-adjust: exact` in print CSS | Test actual PDF output, not browser preview |

---

## 4. Export PDF API Route (P3.4)

### Request Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 4.1 | POST request missing `type` field | Return 400: "PDF type required. Must be 'tailored' or 'comparison'" | Send without type |
| 4.2 | POST request with invalid `type` (e.g., "docx") | Return 400: "Invalid PDF type. Must be 'tailored' or 'comparison'" | Send `{ type: "docx" }` |
| 4.3 | POST request missing required data fields | Return 400 with specific field name: "Missing required field: tailoredResume" | Send `{ type: "tailored" }` without data |
| 4.4 | POST request with empty data fields (null resume) | Return 400: "Resume data is required" | Send `{ type: "tailored", resume: null }` |
| 4.5 | Request body exceeds Next.js body size limit (4MB default) | Increase limit for this route; or reject with "Request too large" | Send 5MB JSON payload |

### Response Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 4.6 | PDF buffer is empty (0 bytes) | Never return empty PDF; check buffer size before sending | Guard clause: `if (pdfBuffer.length === 0) throw Error` |
| 4.7 | PDF buffer is very large (>10MB) | Compress with PDF optimization; or warn user | Test with 20-page comparison PDF |
| 4.8 | Content-Disposition header fails to trigger download in browser | Set `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="..."` | Test in Chrome, Firefox, Safari, Edge |
| 4.9 | Filename contains special characters (spaces, quotes) | Sanitize: replace spaces with hyphens, remove quotes | Test with resume name "John's Resume" |
| 4.10 | Browser previews PDF instead of downloading | Use `Content-Disposition: attachment` (not `inline`) to force download | Test with inline vs attachment |
| 4.11 | Very long load time (>10s) for PDF generation | Show progress on client side; increase timeout for this route | Profile with large data |

### Error Handling

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 4.12 | Playwright crashes mid-generation | Return 500: "PDF generation failed. Please try again." | Kill Playwright process mid-render |
| 4.13 | HTML template rendering throws JavaScript error | Wrap in try-catch; return error with sanitized message | Inject intentional JS error in template |
| 4.14 | Disk write fails for temp files | Fall back to in-memory PDF generation | Fill disk to capacity |

---

## 5. Export Page & Navigation (P3.5, P3.6)

### UI/UX Edge Cases

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 5.1 | User navigates to `/export` without any data | Redirect to `/dashboard` with message: "Please analyze your resume first" | Type `/export` directly in URL |
| 5.2 | User clicks both download buttons simultaneously | Both requests go through; each download is independent | Click both buttons rapidly |
| 5.3 | User clicks same download button repeatedly | Debounce; only one request at a time | Click download 10 times |
| 5.4 | Download fails mid-stream (network disconnects) | Browser shows "Failed - Network error" in download bar | Disconnect Wi-Fi mid-download |
| 5.5 | PDF preview (if any) doesn't match downloaded PDF | Preview is separate from download; both should use the same generation code | Compare preview with download |
| 5.6 | Browser doesn't support PDF download (very old browser) | Show link: "If download doesn't start, click here" | Test in IE11 (if needed) |
| 5.7 | Mobile browser: PDF opens in new tab instead of downloading | Mobile browsers may auto-preview; acceptable | Test on Safari iOS, Chrome Android |
| 5.8 | Download starts but user navigates away | Download continues in browser; file will be saved | Navigate away mid-download |
| 5.9 | Export page is refreshed | Data should persist from session storage | Refresh export page |

---

## 6. Multi-Page Content Handling (P3.7)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 6.1 | Resume content spans 2 pages | Page break occurs at natural section boundary | Test with 2-page content |
| 6.2 | Resume content spans 10+ pages | Acceptable but rare; ensure no memory issues | Test with 10+ page content |
| 6.3 | Page break occurs in the middle of a bullet | Prevent with `page-break-inside: avoid` on bullet items | Test with bullet at page boundary |
| 6.4 | Page break occurs in the middle of a section header | Prevent with `page-break-after: avoid` on headers | Test with section header at bottom |
| 6.5 | Widow/orphan lines at page breaks (single line at top/bottom) | Use `widows: 3` and `orphans: 3` in CSS print rules | Test for single lines on pages |
| 6.6 | Comparison PDF has different page breaks than tailored PDF | Each is independent; they may not align | Acceptable — they are separate documents |
| 6.7 | Page numbers are desired but not implemented | Optional enhancement; not required for MVP | Acceptable |

---

## 7. PDF Caching (P3.8)

| # | Scenario | Expected Handling | Test Strategy |
|---|---|---|---|
| 7.1 | Identical request returns cached PDF | No Playwright call; instant response | Send same request twice, measure time |
| 7.2 | Cache key collision (different data, same hash) | Extremely unlikely; use SHA256 of JSON.stringify(all inputs) | N/A |
| 7.3 | Cache grows too large (>100MB of PDFs) | LRU eviction; max 50 cached PDFs | Generate 51 different PDFs |
| 7.4 | Cache persists across server restarts | In-memory cache resets; acceptable for MVP | Restart server; verify first request is slow |
| 7.5 | Stale cache (user edits resume, re-exports) | Include version or timestamp in cache key | Re-export after editing resume |
| 7.6 | Cache includes user's PII in key | Hash the entire data object; PII is in the hash, not visible | Verify cache key doesn't contain raw text |
| 7.7 | Cache for comparison PDF vs tailored PDF are independent | Separate keys for different types | Export both types and verify separate caches |

---

## 8. Testing Strategy for Phase 3 Edge Cases

### Unit Tests

```typescript
describe('PDF Generator', () => {
  it('should generate valid PDF buffer', () => { /* ... */ });
  it('should reject invalid PDF type', () => { /* ... */ });
  it('should return cached PDF for same inputs', () => { /* ... */ });
  it('should handle missing data gracefully', () => { /* ... */ });
  it('should not leak PII in cache keys', () => { /* ... */ });
});
```

### Integration Tests

```typescript
describe('POST /api/export-pdf', () => {
  it('should return PDF for tailored type', () => { /* verify Content-Type */ });
  it('should return PDF for comparison type', () => { /* verify Content-Type */ });
  it('should return 400 for missing type', () => { /* ... */ });
  it('should return 400 for invalid type', () => { /* ... */ });
  it('should return 400 for missing data', () => { /* ... */ });
  it('should return 405 for GET requests', () => { /* ... */ });
});
```

### Visual Regression Testing

- [ ] Tailored resume PDF: compare rendered output with expected layout
- [ ] Comparison PDF: verify two-column layout, highlights, and score section
- [ ] Page breaks occur at correct locations (not mid-bullet)
- [ ] Fonts render correctly (no missing character boxes)
- [ ] Special characters, emoji, non-ASCII render correctly

### Manual Test Checklist

- [ ] Tailored resume PDF downloads and looks professional
- [ ] Side-by-side comparison PDF downloads with correct two-column layout
- [ ] Changed bullets are highlighted with green background
- [ ] Original and tailored scores appear in PDF header
- [ ] Gap analysis section renders in comparison PDF
- [ ] Disclaimer is present at the bottom of both PDFs
- [ ] Multi-page resumes have proper page breaks
- [ ] Empty sections are hidden in PDF (not shown as blank headers)
- [ ] Caching returns instant response for repeated identical requests
- [ ] `npx tsc --noEmit` passes
- [ ] Download filenames are descriptive and sanitized
