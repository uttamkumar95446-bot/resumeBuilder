# Vercel Deployment Plan

**Version:** 1.0 | **Last Updated:** June 10, 2026
**Target Platform:** Vercel (Pro Plan recommended)

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Variables](#2-environment-variables)
3. [Build & Function Configuration](#3-build--function-configuration)
4. [PDF Generation on Vercel](#4-pdf-generation-on-vercel)
5. [Deployment Steps](#5-deployment-steps)
6. [Post-Deployment Verification](#6-post-deployment-verification)
7. [Troubleshooting](#7-troubleshooting)
8. [Cost Considerations](#8-cost-considerations)

---

## 1. Prerequisites

| Requirement | Details |
|---|---|
| **Vercel Account** | Pro plan ($20/mo) required for functions >10s |
| **GitHub Repository** | Code pushed to GitHub |
| **Groq API Key** | Free tier at https://console.groq.com |
| **Node.js** | 20+ locally for testing |

### Why Vercel Pro?

| Route | Time Needed | Hobby Limit | Pro Limit |
|---|---|---|---|
| `/api/analyze` | ~20-30s (LLM calls) | 10s | 60s+ |
| `/api/tailor` | ~20-30s (LLM calls) | 10s | 60s+ |
| `/api/export-pdf` | ~10-15s (Chromium boot) | 10s | 30s |

> If routes exceed 60s, switch Groq model to `llama-3.1-8b-instant` (3x faster).

---

## 2. Environment Variables

Set in Vercel Dashboard -> Settings -> Environment Variables:

| Variable | Required | Default | Notes |
|---|---|---|---|
| `GROQ_API_KEY` | **Yes** | - | Get from https://console.groq.com |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Use `llama-3.1-8b-instant` for speed |
| `LOG_LEVEL` | No | `info` | debug, info, warn, error |

Add to both Preview and Production environments.

---

## 3. Build & Function Configuration

### next.config.ts

```ts
const nextConfig: NextConfig = {
  serverExternalPackages: ['playwright-core'],
};
```

### vercel.json

```json
{
  "functions": {
    "src/app/api/analyze/route.ts": { "maxDuration": 60 },
    "src/app/api/tailor/route.ts": { "maxDuration": 60 },
    "src/app/api/export-pdf/route.ts": { "maxDuration": 30 },
    "src/app/api/parse-resume/route.ts": { "maxDuration": 30 },
    "src/app/api/parse-jd/route.ts": { "maxDuration": 30 }
  }
}
```

### Build Settings

Vercel auto-detects Next.js. Default build settings work.

---

## 4. PDF Generation on Vercel

### The Challenge

Standard `playwright` bundles Chromium (~400MB) which exceeds Vercel's 250MB function limit.

### The Solution

- **`playwright-core`** -- API layer without bundled browser (~2MB)
- **`@sparticuz/chromium`** -- Serverless-optimized Chromium binary (~120MB)

The PDF generator (`src/lib/pdf/pdf-generator.ts`) auto-detects Vercel env and uses the correct Chromium path. On local dev, it falls back to default system lookup or `PLAYWRIGHT_CHROMIUM_PATH` env var.

### PDF Caching

In-memory cache with 24h TTL, max 100 entries. Repeated identical requests skip Chromium launch.

---

## 5. Deployment Steps

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Vercel deployment setup"
git push origin main
```

### Step 2: Import to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel auto-detects Next.js

### Step 3: Configure Environment Variables

Add `GROQ_API_KEY` (and optionally `GROQ_MODEL`, `LOG_LEVEL`) in Vercel Dashboard -> Settings -> Environment Variables.

### Step 4: Deploy

Click **Deploy**. Build takes ~2-5 minutes.

### Step 5: Verify

1. Open the deployed URL
2. Click **Load Sample Data**
3. Click **Analyze Match** -- verify results load within 60s
4. Click **Generate Tailored Resume** -- verify output
5. Go to **Export** -- check 3 checkboxes -- download PDF

---

## 6. Post-Deployment Verification

### Test Checklist

- [ ] Landing page loads
- [ ] Dashboard loads sample data
- [ ] Analyze returns results within 60s
- [ ] Tailor generates resume
- [ ] PDF downloads and renders correctly
- [ ] Rate limiting triggers after 10 rapid requests

### Monitor Logs

Vercel Dashboard -> Project -> Logs:
- Check for `[ERROR]` entries in API route logs
- Verify all 5 function instances are healthy

---

## 7. Troubleshooting

### PDF Export returns 500

| Cause | Fix |
|---|---|
| Chromium not found | Verify `@sparticuz/chromium` in package.json |
| Function timeout | Increase `maxDuration` in vercel.json |
| Bundle >250MB | Check build logs for size |

### Groq API 429 (Rate Limited)

| Cause | Fix |
|---|---|
| Daily token limit | Wait for reset or upgrade at https://console.groq.com |
| Per-minute limit | App has built-in retry; wait ~1 min |

### Analyze Route Times Out

| Cause | Fix |
|---|---|
| Slow LLM | Switch to `llama-3.1-8b-instant` via GROQ_MODEL |
| Vercel timeout | Increase `maxDuration` to 120s in vercel.json |

### Local Dev: PDF Fails

After switching to `playwright-core`, install Chromium locally:
```bash
npx playwright install chromium
# OR set env var:
# PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome
```

---

## 8. Cost Considerations

| Item | Hobby (Free) | Pro ($20/mo) |
|---|---|---|
| Function Duration | 10s max | 60s+ (Pro required) |
| Bandwidth | 100 GB/mo | 1000 GB/mo |
| Build Minutes | 100h/mo | 6,000h/mo |
| Serverless Executions | 500K/mo | 5M/mo |

### Monthly Estimate (Pro Plan)

| Item | Cost |
|---|---|
| Vercel Pro | $20/mo |
| Groq API (free tier) | $0 |
| **Total** | **$20/mo** |

---

## Quick Start

```bash
git push origin main
# Import to Vercel -> Add GROQ_API_KEY -> Deploy
```
