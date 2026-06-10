import { runPrompt } from '@/lib/llm/prompt-runner';
import { MatchScoreSchema, type MatchScore } from '@/lib/schemas/match-score';
import { MATCH_SCORING_PROMPT } from '../../../prompts/match-scoring';
import type { ResumeProfile, JobDescriptionProfile } from '@/types';

export async function scoreMatch(
  resume: ResumeProfile,
  jd: JobDescriptionProfile
): Promise<MatchScore> {
  const prompt = MATCH_SCORING_PROMPT
    .replace('{{RESUME_JSON}}', JSON.stringify(resume))
    .replace('{{JD_JSON}}', JSON.stringify(jd));

  const { data } = await runPrompt(prompt, MatchScoreSchema);
  return data;
}
