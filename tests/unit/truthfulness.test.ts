import { describe, it, expect } from 'vitest';
import type { ResumeProfile, TailoredResume } from '@/types';

const mockOriginal: ResumeProfile = {
  summary: 'A skilled developer.',
  skills: ['TypeScript', 'React', 'Node.js'],
  experience: [
    {
      company: 'TechCorp',
      title: 'Developer',
      startDate: '2020-01',
      endDate: '2023-12',
      bullets: ['Built applications with React', 'Handled 1000+ requests per day'],
    },
  ],
  education: [],
  projects: [],
  certifications: [],
};

const mockTailored: TailoredResume = {
  tailoredSummary: 'A skilled developer.',
  tailoredSkills: ['TypeScript', 'React', 'Node.js', 'Kubernetes'],
  tailoredExperience: [
    {
      company: 'TechCorp',
      title: 'Senior Developer',
      bullets: [
        {
          original: 'Built applications with React',
          tailored: 'Architected React applications serving 2000+ users',
          confidence: 'high',
          changeReason: 'Added impact metrics',
          keywordsAddressed: ['React'],
          riskFlag: undefined,
        },
      ],
    },
  ],
};

describe('Truthfulness Checker', () => {
  it('should detect new technologies not in original skills', async () => {
    const { checkTruthfulness } = await import('@/lib/utils/truthfulness');
    const issues = checkTruthfulness(mockOriginal, mockTailored);
    const techIssues = issues.filter((i) => i.type === 'new_technology');
    expect(techIssues.length).toBeGreaterThanOrEqual(1);
    expect(techIssues.some((i) => i.tailored === 'Kubernetes')).toBe(true);
  });

  it('should detect new numbers in tailored version', async () => {
    const { checkTruthfulness } = await import('@/lib/utils/truthfulness');
    const issues = checkTruthfulness(mockOriginal, mockTailored);
    const numIssues = issues.filter((i) => i.type === 'new_number');
    expect(numIssues.length).toBeGreaterThanOrEqual(1);
  });

  it('should return empty for identical versions', async () => {
    const { checkTruthfulness } = await import('@/lib/utils/truthfulness');
    const identical: TailoredResume = {
      tailoredSummary: 'A skilled developer.',
      tailoredSkills: ['TypeScript', 'React', 'Node.js'],
      tailoredExperience: mockOriginal.experience.map((e) => ({
        company: e.company,
        title: e.title,
        bullets: e.bullets.map((b) => ({
          original: b,
          tailored: b,
          confidence: 'high' as const,
          changeReason: '',
          keywordsAddressed: [],
          riskFlag: undefined,
        })),
      })),
    };
    const issues = checkTruthfulness(mockOriginal, identical);
    expect(issues.length).toBe(0);
  });
});
