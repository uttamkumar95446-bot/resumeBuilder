import type { ResumeProfile, JobDescriptionProfile, MatchScore, TailoredResume } from '@/types';

export interface ValidationIssue {
  type: 'score_inconsistency' | 'date_contradiction' | 'keyword_stuffing' | 'missing_required_skill' | 'overly_generic';
  field: string;
  detail: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

function validateScoreConsistency(originalScore: MatchScore, tailoredScore: MatchScore): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const [label, score] of [['Original', originalScore], ['Tailored', tailoredScore]] as const) {
    const subScores = [score.skillCoverageScore, score.responsibilityAlignmentScore, score.keywordScore, score.seniorityScore];
    const avg = Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length);
    if (Math.abs(score.overallScore - avg) > 20) {
      issues.push({
        type: 'score_inconsistency', field: label + ' Score',
        detail: label + ' overall (' + score.overallScore + ') differs from avg sub-score (' + avg + ').',
        severity: 'medium',
        suggestion: 'Verify overall score is a reasonable composite of sub-scores.',
      });
    }
    if (score.criticalMissingRequirements.length > 0 &&
        !score.criticalMissingRequirements.some((r) => score.explanation.toLowerCase().includes(r.toLowerCase().substring(0, 20)))) {
      issues.push({
        type: 'score_inconsistency', field: label + ' Explanation',
        detail: label + ' lists missing requirements not mentioned in explanation.',
        severity: 'low',
        suggestion: 'Update explanation to reference specific missing requirements.',
      });
    }
  }

  if (tailoredScore.overallScore < originalScore.overallScore - 5) {
    issues.push({
      type: 'score_inconsistency', field: 'Score Regression',
      detail: 'Tailored score (' + tailoredScore.overallScore + ') lower than original (' + originalScore.overallScore + ').',
      severity: 'high',
      suggestion: 'Review tailoring quality.',
    });
  }

  return issues;
}

function checkKeywordStuffing(jd: JobDescriptionProfile, tailored: TailoredResume): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const allText = tailored.tailoredExperience.flatMap((e) => e.bullets.map((b) => b.tailored)).join(' ').toLowerCase();
  const originalText = tailored.tailoredExperience.flatMap((e) => e.bullets.map((b) => b.original)).join(' ').toLowerCase();
  const keywords = [...jd.requiredSkills, ...jd.preferredSkills].map((s) => s.toLowerCase().trim()).filter((k) => k.length >= 3);

  for (const kw of keywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const count = (allText.match(regex) || []).length;
    const origCount = (originalText.match(regex) || []).length;
    if (count > origCount + 3 && count >= 5) {
      issues.push({
        type: 'keyword_stuffing', field: 'Keyword: ' + kw,
        detail: '"' + kw + '" appears ' + count + 'x (was ' + origCount + 'x). May look like stuffing.',
        severity: 'medium',
        suggestion: 'Reduce "' + kw + '" to 2-3 natural mentions.',
      });
    }
  }
  return issues;
}

function checkRequiredSkillsAddressed(jd: JobDescriptionProfile, tailored: TailoredResume): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const text = [
    tailored.tailoredSummary,
    ...tailored.tailoredSkills,
    ...tailored.tailoredExperience.flatMap((e) => e.bullets.map((b) => b.tailored)),
  ].join(' ').toLowerCase();

  for (const skill of jd.requiredSkills) {
    if (skill.length < 2) continue;
    const words = skill.toLowerCase().split(/[\s/]+/);
    if (!words.some((w) => w.length >= 3 && text.includes(w))) {
      issues.push({
        type: 'missing_required_skill', field: 'Required: ' + skill,
        detail: 'Required skill "' + skill + '" not explicitly addressed in tailored resume.',
        severity: 'high',
        suggestion: 'Consider incorporating "' + skill + '" if you have genuine experience.',
      });
    }
  }
  return issues;
}

function checkOverlyGeneric(tailored: TailoredResume): ValidationIssue[] {
  const patterns = [
    /team\s+player/i, /go-getter/i, /think\s+outside\s+the\s+box/i,
    /results-driven/i, /hardworking/i, /detail[-\s]oriented/i,
    /excellent\s+(communication|written\s+and\s+verbal)\s+skills/i,
    /self[-\s]starter/i, /highly\s+motivated/i,
  ];
  const text = [tailored.tailoredSummary, ...tailored.tailoredSkills].join(' ');
  return patterns.filter((p) => p.test(text)).map((p) => ({
    type: 'overly_generic' as const,
    field: 'Tailored Summary',
    detail: 'Generic phrase found in summary. Recruiters commonly overlook these.',
    severity: 'low' as const,
    suggestion: 'Replace with a concrete achievement or skill demonstration.',
  }));
}

export function validateLLMOutput(
  originalScore: MatchScore,
  tailoredScore: MatchScore,
  _resume: ResumeProfile,
  tailored: TailoredResume,
  jd: JobDescriptionProfile,
): ValidationIssue[] {
  return [
    ...validateScoreConsistency(originalScore, tailoredScore),
    ...checkKeywordStuffing(jd, tailored),
    ...checkRequiredSkillsAddressed(jd, tailored),
    ...checkOverlyGeneric(tailored),
  ];
}

export function formatValidationWarnings(issues: ValidationIssue[]): string[] {
  return issues
    .filter((i) => i.severity === 'high' || i.severity === 'medium')
    .map((i) => '[' + i.severity.toUpperCase() + '] ' + i.detail + (i.suggestion ? ' ' + i.suggestion : ''));
}
