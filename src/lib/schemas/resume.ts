import { z } from 'zod';

export const ExperienceEntrySchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bullets: z.array(z.string()),
});

export const ProjectEntrySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  url: z.string().optional(),
});

export const EducationEntrySchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
});

export const ResumeProfileSchema = z.object({
  contact: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    portfolio: z.string().optional(),
  }).optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()),
  experience: z.array(ExperienceEntrySchema),
  projects: z.array(ProjectEntrySchema),
  education: z.array(EducationEntrySchema),
  certifications: z.array(z.string()),
  language: z.string().optional(),
});

export type ResumeProfile = z.infer<typeof ResumeProfileSchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
