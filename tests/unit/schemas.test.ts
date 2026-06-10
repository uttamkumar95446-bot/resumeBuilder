import { describe, it, expect } from 'vitest';

describe('Zod Schemas', () => {
  it('should be importable', async () => {
    const { ResumeProfileSchema } = await import('@/lib/schemas/resume');
    expect(ResumeProfileSchema).toBeDefined();
  });

  it('should validate a valid resume profile', async () => {
    const { ResumeProfileSchema } = await import('@/lib/schemas/resume');
    const validResume = {
      summary: 'A skilled developer with 5 years of experience.',
      skills: ['TypeScript', 'React', 'Node.js'],
      experience: [
        {
          company: 'TechCorp',
          title: 'Senior Developer',
          startDate: '2020-01',
          endDate: '2023-12',
          bullets: ['Built scalable web applications', 'Led a team of 3 developers'],
        },
      ],
      education: [
        {
          institution: 'UC Berkeley',
          degree: 'BS',
          field: 'Computer Science',
          year: 2020,
        },
      ],
      projects: [],
    };
    const result = ResumeProfileSchema.safeParse(validResume);
    expect(result.success).toBe(true);
  });

  it('should reject an invalid resume profile', async () => {
    const { ResumeProfileSchema } = await import('@/lib/schemas/resume');
    const invalidResume = { summary: 123 };
    const result = ResumeProfileSchema.safeParse(invalidResume);
    expect(result.success).toBe(false);
  });
});
