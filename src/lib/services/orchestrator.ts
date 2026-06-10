import { parseResume } from './resume-parser';
import { parseJD } from './jd-parser';
import { scoreMatch } from './match-scorer';
import { tailorResume } from './tailoring-service';
import { analyzeGaps } from './gap-analysis';
import type { ResumeProfile, JobDescriptionProfile, MatchScore, TailoredResume, GapAnalysis, ProjectEntry } from '@/types';

/** Convert a TailoredResume back to ResumeProfile shape for scoring/analysis */
function tailoredToResumeProfile(
  original: ResumeProfile,
  tailored: TailoredResume
): ResumeProfile {
  return {
    ...original,
    summary: tailored.tailoredSummary || original.summary,
    skills: tailored.tailoredSkills,
    experience: tailored.tailoredExperience.map((e) => ({
      company: e.company,
      title: e.title,
      startDate: original.experience.find((oe) => oe.company === e.company)?.startDate,
      endDate: original.experience.find((oe) => oe.company === e.company)?.endDate,
      bullets: e.bullets.map((b) => b.tailored),
    })),
    projects: (tailored.tailoredProjects ?? original.projects) as ProjectEntry[],
  };
}

export interface AnalyzeResult {
  resume: ResumeProfile;
  jd: JobDescriptionProfile;
  originalScore: MatchScore;
  originalGaps: GapAnalysis;
  warnings: string[];
}

export interface TailorResult {
  tailoredResume: TailoredResume;
  tailoredScore: MatchScore;
  tailoredGaps: GapAnalysis;
  warnings: string[];
}

export interface FullPipelineResult {
  resume: ResumeProfile;
  jd: JobDescriptionProfile;
  originalScore: MatchScore;
  tailoredScore: MatchScore;
  gaps: GapAnalysis;
  tailoredResume: TailoredResume;
  warnings: string[];
}

export async function analyzeResumeVsJD(
  resumeText: string,
  jdText: string
): Promise<AnalyzeResult> {
  const warnings: string[] = [];

  // Step 1: Parse both in parallel
  const [resumeResult, jdResult] = await Promise.all([
    parseResume(resumeText),
    parseJD(jdText),
  ]);

  warnings.push(...resumeResult.warnings);
  warnings.push(...jdResult.warnings);

  // Step 2: Score original + analyze gaps in parallel
  const [originalScore, originalGaps] = await Promise.all([
    scoreMatch(resumeResult.resume, jdResult.jd),
    analyzeGaps(resumeResult.resume, jdResult.jd),
  ]);

  return {
    resume: resumeResult.resume,
    jd: jdResult.jd,
    originalScore,
    originalGaps,
    warnings,
  };
}

export async function runTailoringPipeline(
  resumeText: string,
  jdText: string
): Promise<FullPipelineResult> {
  const warnings: string[] = [];

  // Step 1: Parse both in parallel
  const [resumeResult, jdResult] = await Promise.all([
    parseResume(resumeText),
    parseJD(jdText),
  ]);
  warnings.push(...resumeResult.warnings);
  warnings.push(...jdResult.warnings);

  // Step 2: Tailor resume (sequential within)
  const tailoredResume = await tailorResume(resumeResult.resume, jdResult.jd);

  const tailoredAsProfile = tailoredToResumeProfile(resumeResult.resume, tailoredResume);

  // Step 3: Score + analyze gaps (both original and tailored) in parallel
  const [originalScore, tailoredScore, originalGaps, tailoredGaps] = await Promise.all([
    scoreMatch(resumeResult.resume, jdResult.jd),
    scoreMatch(tailoredAsProfile, jdResult.jd),
    analyzeGaps(resumeResult.resume, jdResult.jd),
    analyzeGaps(tailoredAsProfile, jdResult.jd),
  ]);

  return {
    resume: resumeResult.resume,
    jd: jdResult.jd,
    originalScore,
    tailoredScore,
    gaps: tailoredGaps,
    tailoredResume,
    warnings,
  };
}
