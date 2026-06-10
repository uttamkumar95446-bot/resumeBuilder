import { runPrompt } from '@/lib/llm/prompt-runner';
import { GapAnalysisSchema, type GapAnalysis } from '@/lib/schemas/gap-analysis';
import { GAP_ANALYSIS_PROMPT } from '../../../prompts/gap-analysis';
import type { ResumeProfile, JobDescriptionProfile } from '@/types';

export async function analyzeGaps(
  resume: ResumeProfile,
  jd: JobDescriptionProfile
): Promise<GapAnalysis> {
  const prompt = GAP_ANALYSIS_PROMPT
    .replace('{{RESUME_JSON}}', JSON.stringify(resume))
    .replace('{{JD_JSON}}', JSON.stringify(jd));

  const { data } = await runPrompt(prompt, GapAnalysisSchema);
  return data;
}
