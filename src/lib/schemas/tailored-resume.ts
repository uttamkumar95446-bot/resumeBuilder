import { z } from 'zod';

export const TailoredBulletSchema = z.object({
  original: z.string().min(1),
  tailored: z.string().min(1),
  changeReason: z.string(),
  keywordsAddressed: z.array(z.string()),
  confidence: z.enum(['high', 'medium', 'low']),
  riskFlag: z.string().optional(),
});

export const TailoredExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  bullets: z.array(TailoredBulletSchema),
});

export const TailoredResumeSchema = z.object({
  tailoredSummary: z.string(),
  tailoredSkills: z.array(z.string()),
  tailoredExperience: z.array(TailoredExperienceSchema),
  tailoredProjects: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    technologies: z.array(z.string()).optional(),
  })).optional(),
});

export type TailoredBullet = z.infer<typeof TailoredBulletSchema>;
export type TailoredExperience = z.infer<typeof TailoredExperienceSchema>;
export type TailoredResume = z.infer<typeof TailoredResumeSchema>;
