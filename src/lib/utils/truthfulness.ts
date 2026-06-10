import type { ResumeProfile, TailoredResume } from '@/types';

export interface TruthfulnessIssue {
  type: 'new_company' | 'new_number' | 'new_technology' | 'inflated_claim';
  original: string;
  tailored: string;
  detail: string;
  severity: 'low' | 'medium' | 'high';
}

function extractNumbers(text: string): string[] {
  return text.match(/\b(\d+[%]?)\b/g) ?? [];
}

function extractTechnologies(text: string, knownSkills: string[]): string[] {
  const words = text.split(/[\s,;.()]+/);
  const lowerKnown = knownSkills.map((s) => s.toLowerCase());
  const skipWords = new Set([
    'the','this','that','these','those','what','which','who','where','when',
    'how','and','but','or','for','nor','yet','so','our','your','my','we',
    'i','it','he','she','they','me',
  ]);
  return words.filter(
    (w) => w.length >= 2 && /^[A-Z][a-zA-Z+#.]+/.test(w) && !lowerKnown.includes(w.toLowerCase()) && !skipWords.has(w.toLowerCase())
  );
}

function checkNewCompanies(original: ResumeProfile, tailored: TailoredResume): TruthfulnessIssue[] {
  const originalCompanies = original.experience.map((e) => e.company.toLowerCase().trim());
  return tailored.tailoredExperience
    .filter((exp) => {
      const lower = exp.company.toLowerCase().trim();
      return !originalCompanies.includes(lower) &&
        !original.experience.some(
          (oe) => oe.company.toLowerCase().includes(lower) || lower.includes(oe.company.toLowerCase())
        );
    })
    .map((exp) => ({
      type: 'new_company' as const,
      original: exp.company,
      tailored: exp.company,
      detail: 'Company "' + exp.company + '" does not appear in your original resume.',
      severity: 'high' as const,
    }));
}

function checkNewNumbers(original: ResumeProfile, tailored: TailoredResume): TruthfulnessIssue[] {
  const originalNumbers = new Set(extractNumbers(original.experience.flatMap((e) => e.bullets).join(' ')));
  const issues: TruthfulnessIssue[] = [];
  for (const exp of tailored.tailoredExperience) {
    for (const bullet of exp.bullets) {
      for (const num of extractNumbers(bullet.tailored)) {
        if (!originalNumbers.has(num) && !extractNumbers(bullet.original).includes(num)) {
          issues.push({
            type: 'new_number',
            original: bullet.original,
            tailored: bullet.tailored,
            detail: 'New number "' + num + '" introduced in tailored version. Verify this is accurate.',
            severity: 'medium',
          });
        }
      }
    }
  }
  return issues;
}

function checkNewTechnologies(original: ResumeProfile, tailored: TailoredResume): TruthfulnessIssue[] {
  const originalText = [
    ...original.skills,
    ...original.experience.flatMap((e) => e.bullets),
    original.summary || '',
  ].join(' ');
  const knownSkills = [...original.skills, ...extractTechnologies(originalText, [])];
  const issues: TruthfulnessIssue[] = [];

  for (const skill of tailored.tailoredSkills) {
    if (!original.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      issues.push({
        type: 'new_technology',
        original: '',
        tailored: skill,
        detail: '"' + skill + '" was not in your original resume skills. Only include if you genuinely have this skill.',
        severity: 'high',
      });
    }
  }

  for (const exp of tailored.tailoredExperience) {
    for (const bullet of exp.bullets) {
      for (const tech of extractTechnologies(bullet.tailored, knownSkills)) {
        if (!extractTechnologies(bullet.original, knownSkills).includes(tech)) {
          issues.push({
            type: 'new_technology',
            original: bullet.original,
            tailored: bullet.tailored,
            detail: 'Technology "' + tech + '" introduced in tailored version. Verify this accurately reflects your experience.',
            severity: 'medium',
          });
        }
      }
    }
  }
  return issues;
}

function checkInflatedClaims(_original: ResumeProfile, tailored: TailoredResume): TruthfulnessIssue[] {
  const patterns = [
    /led\s+(the\s+)?(entire|whole|complete)\s+(company|organization|department)/i,
    /single-handedly/i,
    /solely\s+responsible/i,
    /100%\s+(of\s+)?/i,
  ];
  const issues: TruthfulnessIssue[] = [];
  for (const exp of tailored.tailoredExperience) {
    for (const bullet of exp.bullets) {
      for (const pat of patterns) {
        if (pat.test(bullet.tailored) && !pat.test(bullet.original)) {
          issues.push({
            type: 'inflated_claim',
            original: bullet.original,
            tailored: bullet.tailored,
            detail: 'Tailored version may contain an inflated claim: "' + bullet.tailored + '". Verify this accurately represents your role.',
            severity: 'high',
          });
        }
      }
    }
  }
  return issues;
}

export function checkTruthfulness(original: ResumeProfile, tailored: TailoredResume): TruthfulnessIssue[] {
  return [
    ...checkNewCompanies(original, tailored),
    ...checkNewNumbers(original, tailored),
    ...checkNewTechnologies(original, tailored),
    ...checkInflatedClaims(original, tailored),
  ];
}

export function flagRiskBullets(tailored: TailoredResume, issues: TruthfulnessIssue[]): Set<string> {
  const flagged = new Set<string>();
  for (const issue of issues) {
    for (let ei = 0; ei < tailored.tailoredExperience.length; ei++) {
      for (let bi = 0; bi < tailored.tailoredExperience[ei].bullets.length; bi++) {
        if (tailored.tailoredExperience[ei].bullets[bi].tailored === issue.tailored) {
          flagged.add(ei + ':' + bi);
        }
      }
    }
  }
  return flagged;
}
