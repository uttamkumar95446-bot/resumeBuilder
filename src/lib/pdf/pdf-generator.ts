import { chromium } from 'playwright-core';
import { generateTailoredResumeHtml } from './tailored-resume-template';
import { generateComparisonHtml } from './comparison-template';
import type { ResumeProfile, JobDescriptionProfile, MatchScore, TailoredResume, GapAnalysis } from '@/types';

const pdfCache = new Map<string, { buffer: Buffer; createdAt: number }>();
const PDF_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

function getCacheKey(type: string, data: unknown): string {
  const str = type + JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 'pdf_' + hash;
}

function getCachedPdf(key: string): Buffer | null {
  const entry = pdfCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.createdAt + PDF_CACHE_TTL_MS) {
    pdfCache.delete(key);
    return null;
  }
  return entry.buffer;
}

function setCachedPdf(key: string, buffer: Buffer): void {
  if (pdfCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = pdfCache.keys().next().value;
    if (firstKey) pdfCache.delete(firstKey);
  }
  pdfCache.set(key, { buffer, createdAt: Date.now() });
}

export interface PdfInput {
  type: 'tailored' | 'comparison';
  resume: ResumeProfile;
  jd: JobDescriptionProfile;
  originalScore: MatchScore;
  tailoredScore: MatchScore;
  tailoredResume: TailoredResume;
  gaps: GapAnalysis;
}

/**
 * Returns the Chromium configuration for the current deployment environment.
 * Uses @sparticuz/chromium on Vercel/Lambda, falls back to local lookup.
 */
async function getChromiumConfig(): Promise<{ executablePath?: string; args: string[] }> {
  const defaultArgs = ['--no-sandbox', '--disable-setuid-sandbox'];

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const chromiumExec = await import('@sparticuz/chromium');
      const mod = chromiumExec.default || chromiumExec;
      return {
        executablePath: await mod.executablePath(),
        args: mod.args || defaultArgs,
      };
    } catch {
      console.warn('@sparticuz/chromium not available. Falling back to default Chromium lookup.');
      return { executablePath: undefined, args: defaultArgs };
    }
  }

  // Local development
  return {
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    args: defaultArgs,
  };
}

export async function generatePdf(input: PdfInput): Promise<Buffer> {
  const cacheKey = getCacheKey(input.type, {
    tailoredResume: input.tailoredResume,
    originalScore: input.originalScore,
    tailoredScore: input.tailoredScore,
  });

  const cached = getCachedPdf(cacheKey);
  if (cached) return cached;

  const html = input.type === 'tailored'
    ? generateTailoredResumeHtml(input.tailoredResume)
    : generateComparisonHtml(
        input.resume,
        input.jd,
        input.originalScore,
        input.tailoredScore,
        input.tailoredResume,
        input.gaps,
      );

  const { executablePath, args: launchArgs } = await getChromiumConfig();

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: launchArgs,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const buffer = await page.pdf({
      format: 'A4',
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
      printBackground: true,
      preferCSSPageSize: true,
    });
    const result = Buffer.from(buffer);
    setCachedPdf(cacheKey, result);
    return result;
  } finally {
    await browser.close();
  }
}

export function clearPdfCache(): void {
  pdfCache.clear();
}

