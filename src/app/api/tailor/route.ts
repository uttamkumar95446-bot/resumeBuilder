import { NextRequest, NextResponse } from 'next/server';
import { runTailoringPipeline } from '@/lib/services/orchestrator';
import { validateBothInputs, validationErrorResponse } from '@/lib/utils/input-validator';
import { checkRateLimit, getRateLimitIdentifier, rateLimitResponse } from '@/lib/utils/rate-limiter';
import { logAPIRequest } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(identifier);
    if (!rateLimit.allowed) {
      logAPIRequest('tailor', 'POST', 429, Date.now() - start);
      return NextResponse.json(rateLimitResponse(rateLimit.retryAfterSeconds), {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      });
    }

    const body = await request.json();
    const { resumeText, jdText } = body;

    const validation = validateBothInputs(resumeText, jdText);
    if (!validation.valid) {
      logAPIRequest('tailor', 'POST', 400, Date.now() - start);
      return NextResponse.json(validationErrorResponse(validation.errors), { status: 400 });
    }

    const result = await runTailoringPipeline(resumeText, jdText);
    logAPIRequest('tailor', 'POST', 200, Date.now() - start);
    return NextResponse.json(result);
  } catch (error) {
    const duration = Date.now() - start;
    logAPIRequest('tailor', 'POST', 500, duration, { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json(
      { error: 'Tailoring failed. Please try again.', code: 'INTERNAL_ERROR' },
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
