import { z } from 'zod';

export const ResumeGapSchema = z.object({
  name: z.string(),
  importance: z.enum(['high', 'medium', 'low']),
  jdEvidence: z.string(),
  resumeEvidence: z.string(),
  suggestedAction: z.string(),
  canSafelyAdd: z.boolean(),
});

export const GapAnalysisSchema = z.object({
  gaps: z.array(ResumeGapSchema),
});

export type ResumeGap = z.infer<typeof ResumeGapSchema>;
export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;
