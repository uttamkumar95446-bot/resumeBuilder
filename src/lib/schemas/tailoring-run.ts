import { z } from 'zod';
import { ResumeProfileSchema } from './resume';
import { JobDescriptionProfileSchema } from './job-description';
import { MatchScoreSchema } from './match-score';
import { GapAnalysisSchema } from './gap-analysis';
import { TailoredResumeSchema } from './tailored-resume';

export const TailoringRunSchema = z.object({
  resume: ResumeProfileSchema,
  jd: JobDescriptionProfileSchema,
  originalScore: MatchScoreSchema,
  tailoredScore: MatchScoreSchema,
  gaps: GapAnalysisSchema,
  tailoredResume: TailoredResumeSchema,
});

export type TailoringRun = z.infer<typeof TailoringRunSchema>;
