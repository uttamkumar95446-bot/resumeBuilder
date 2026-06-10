import { z } from 'zod';

export const JobDescriptionProfileSchema = z.object({
  jobTitle: z.string(),
  company: z.string().nullable(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  qualifications: z.array(z.string()),
  tools: z.array(z.string()),
  keywords: z.array(z.string()),
  seniorityLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'manager', 'director']).nullable(),
  domainSignals: z.array(z.string()),
  softSkills: z.array(z.string()),
});

export type JobDescriptionProfile = z.infer<typeof JobDescriptionProfileSchema>;
