import { describe, it, expect } from 'vitest';

describe('Input Validator', () => {
  it('should accept valid resume input', async () => {
    const { validateResumeInput } = await import('@/lib/utils/input-validator');
    const result = validateResumeInput('A'.repeat(100));
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should reject empty resume input', async () => {
    const { validateResumeInput } = await import('@/lib/utils/input-validator');
    const result = validateResumeInput('');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'EMPTY_INPUT')).toBe(true);
  });

  it('should reject null resume input', async () => {
    const { validateResumeInput } = await import('@/lib/utils/input-validator');
    const result = validateResumeInput(null);
    expect(result.valid).toBe(false);
  });

  it('should reject too-short resume input', async () => {
    const { validateResumeInput } = await import('@/lib/utils/input-validator');
    const result = validateResumeInput('Short');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'TOO_SHORT')).toBe(true);
  });

  it('should validate both inputs', async () => {
    const { validateBothInputs } = await import('@/lib/utils/input-validator');
    const result = validateBothInputs('A'.repeat(100), 'B'.repeat(100));
    expect(result.valid).toBe(true);
  });

  it('should validate export input correctly', async () => {
    const { validateExportInput } = await import('@/lib/utils/input-validator');
    const valid = validateExportInput({ type: 'tailored', resume: {}, jd: {}, originalScore: {}, tailoredScore: {}, tailoredResume: {}, gaps: {} });
    expect(valid.valid).toBe(true);

    const invalid = validateExportInput({ type: 'invalid' });
    expect(invalid.valid).toBe(false);
  });
});
