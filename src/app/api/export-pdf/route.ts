import { NextRequest, NextResponse } from 'next/server';
import { generatePdf, type PdfInput } from '@/lib/pdf/pdf-generator';
import { validateExportInput, validationErrorResponse } from '@/lib/utils/input-validator';
import { checkRateLimit, getRateLimitIdentifier, rateLimitResponse } from '@/lib/utils/rate-limiter';
import { logAPIRequest } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(identifier, 20, 60 * 1000);
    if (!rateLimit.allowed) {
      logAPIRequest('export-pdf', 'POST', 429, Date.now() - start);
      return NextResponse.json(rateLimitResponse(rateLimit.retryAfterSeconds), {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      });
    }

    const body = await request.json();

    const validation = validateExportInput(body);
    if (!validation.valid) {
      logAPIRequest('export-pdf', 'POST', 400, Date.now() - start);
      return NextResponse.json(validationErrorResponse(validation.errors), { status: 400 });
    }

    const pdfBuffer = await generatePdf(body as PdfInput);

    const filename = body.type === 'tailored' ? 'tailored-resume.pdf' : 'resume-comparison.pdf';
    logAPIRequest('export-pdf', 'POST', 200, Date.now() - start);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="' + filename + '"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    const duration = Date.now() - start;
    logAPIRequest('export-pdf', 'POST', 500, duration, { error: error instanceof Error ? error.message : 'Unknown' });
    const message = error instanceof Error ? error.message : 'Export failed. Please try again.';
    return NextResponse.json(
      { error: message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}
