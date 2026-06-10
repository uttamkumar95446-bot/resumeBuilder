interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  for (const [key, entry] of rateLimitMap.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  let entry = rateLimitMap.get(identifier);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitMap.set(identifier, entry);
  }
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
  if (entry.timestamps.length >= maxRequests) {
    const resetMs = entry.timestamps[0] + windowMs;
    return { allowed: false, remaining: 0, resetMs, retryAfterSeconds: Math.ceil((resetMs - now) / 1000) };
  }
  entry.timestamps.push(now);
  return { allowed: true, remaining: maxRequests - entry.timestamps.length, resetMs: now + windowMs, retryAfterSeconds: 0 };
}

export function getRateLimitIdentifier(request: { headers: { get: (name: string) => string | null } }): string {
  const sessionId = request.headers.get('x-session-id');
  if (sessionId) return 'session:' + sessionId;
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return 'ip:' + forwarded.split(',')[0].trim();
  return 'anonymous';
}

export function rateLimitResponse(retryAfterSeconds: number): object {
  return {
    error: 'Rate limit exceeded. Please try again in ' + retryAfterSeconds + ' second' + (retryAfterSeconds !== 1 ? 's' : '') + '.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfterSeconds,
  };
}
