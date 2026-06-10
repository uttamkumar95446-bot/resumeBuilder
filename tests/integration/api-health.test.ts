import { describe, it, expect } from 'vitest';

describe('API Route Health', () => {
  it('analyze route should accept POST and return proper error for missing body', async () => {
    const res = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('parse-resume route should reject empty input', async () => {
    const res = await fetch('http://localhost:3000/api/parse-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' }),
    });
    expect(res.status).toBe(400);
  });

  it('parse-jd route should reject empty input', async () => {
    const res = await fetch('http://localhost:3000/api/parse-jd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' }),
    });
    expect(res.status).toBe(400);
  });

  it('tailor route should reject missing body fields', async () => {
    const res = await fetch('http://localhost:3000/api/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
