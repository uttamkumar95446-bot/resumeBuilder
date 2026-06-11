import type { ResumeProfile, JobDescriptionProfile, MatchScore, TailoredResume, GapAnalysis } from '@/types';

export function generateComparisonHtml(
  resume: ResumeProfile,
  jd: JobDescriptionProfile,
  originalScore: MatchScore,
  tailoredScore: MatchScore,
  tailoredResume: TailoredResume,
  gaps: GapAnalysis,
): string {
  const scoreColor = (s: number): string => s >= 70 ? 'score-good' : s >= 40 ? 'score-medium' : 'score-poor';
  const esc = (str: string): string => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  return html(esc, scoreColor);

  function html(esc: (s: string) => string, sc: (s: number) => string): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 0.5in; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Calibri', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 9.5pt; color: #1a1a1a; line-height: 1.25; }
  .header { text-align: center; margin-bottom: 10pt; padding-bottom: 8pt; border-bottom: 2px solid #333; }
  .header h1 { font-size: 14pt; font-weight: 700; }
  .header p { font-size: 9pt; color: #555; margin-top: 3pt; }
  .section-title { font-size: 11pt; font-weight: 700; border-bottom: 1px solid #999; padding-bottom: 2pt; margin-top: 10pt; margin-bottom: 5pt; text-transform: uppercase; letter-spacing: 0.3px; }
  .scores-grid { display: flex; gap: 10pt; margin-bottom: 6pt; }
  .score-card { flex: 1; border: 1px solid #ddd; border-radius: 4pt; padding: 6pt 8pt; }
  .score-card h3 { font-size: 9pt; font-weight: 700; margin-bottom: 3pt; }
  .score-value { font-size: 18pt; font-weight: 700; }
  .score-label { font-size: 7.5pt; color: #666; }
  .score-caption { font-size: 8pt; color: #444; margin-top: 3pt; }
  .score-good { color: #16a34a; } .score-medium { color: #ca8a04; } .score-poor { color: #dc2626; }
  .skill-tags { display: flex; flex-wrap: wrap; gap: 2pt 4pt; margin-top: 2pt; }
  .skill-tag { background: #f0f0f0; padding: 1pt 5pt; border-radius: 2pt; font-size: 8pt; color: #333; }
  .gap-item { padding: 3pt 0; border-bottom: 1px dotted #eee; font-size: 8.5pt; }
  .gap-name { font-weight: 700; }
  .gap-imp-high { color: #dc2626; font-weight: 700; font-size: 8pt; }
  .gap-imp-medium { color: #ca8a04; font-weight: 700; font-size: 8pt; }
  .gap-imp-low { color: #6b7280; font-weight: 700; font-size: 8pt; }
  .diff-item { margin-bottom: 4pt; padding: 3pt 0; border-bottom: 1px dotted #eee; font-size: 8.5pt; }
  .diff-company { font-weight: 700; font-size: 9pt; }
  .diff-title { font-size: 8.5pt; color: #444; }
  .diff-bullet { font-size: 8pt; line-height: 1.25; margin: 1pt 0; }
  .diff-change { font-size: 7.5pt; color: #555; font-style: italic; }
  .jd-section { font-size: 9pt; margin-bottom: 4pt; }
  .jd-section ul { font-size: 9pt; line-height: 1.25; margin: 2pt 0 0 14pt; }
  .disclaimer { margin-top: 12pt; padding: 6pt 8pt; background: #fef2f2; border: 1px solid #fecaca; border-radius: 3pt; font-size: 7.5pt; color: #991b1b; line-height: 1.5; }
  .page-break { page-break-before: always; }
</style>
</head>
<body>

<div class="header">
  <h1>Resume Comparison Report</h1>
  <p>${esc(jd.jobTitle)}${jd.company ? ' at ' + esc(jd.company) : ''}</p>
</div>

<div class="section-title">Match Scores</div>
<div class="scores-grid">
  <div class="score-card">
    <h3>Original Resume</h3>
    <div class="score-value ${sc(originalScore.overallScore)}">${originalScore.overallScore}%</div>
    <div class="score-label">Overall Match</div>
    <div class="score-caption">Skills: ${originalScore.skillCoverageScore}% | Resp: ${originalScore.responsibilityAlignmentScore}%</div>
  </div>
  <div class="score-card">
    <h3>Tailored Resume</h3>
    <div class="score-value ${sc(tailoredScore.overallScore)}">${tailoredScore.overallScore}%</div>
    <div class="score-label">Overall Match</div>
    <div class="score-caption">Skills: ${tailoredScore.skillCoverageScore}% | Resp: ${tailoredScore.responsibilityAlignmentScore}%</div>
  </div>
</div>

<div class="section-title">JD Summary</div>
<div class="jd-section">
  <strong>Required Skills:</strong><br>
  <div class="skill-tags">${jd.requiredSkills.map(s => '<span class="skill-tag">' + esc(s) + '</span>').join('')}</div>
</div>
${jd.preferredSkills.length > 0 ? '<div class="jd-section"><strong>Preferred Skills:</strong><br><div class="skill-tags">' + jd.preferredSkills.map(s => '<span class="skill-tag">' + esc(s) + '</span>').join('') + '</div></div>' : ''}

<div class="page-break"></div>

<div class="section-title">Gap Analysis</div>
${gaps.gaps.length > 0 ? gaps.gaps.map(g =>
'<div class="gap-item">' +
  '<span class="gap-name">' + esc(g.name) + '</span> ' +
  '<span class="' + (g.importance === 'high' ? 'gap-imp-high' : g.importance === 'medium' ? 'gap-imp-medium' : 'gap-imp-low') + '">[' + g.importance.toUpperCase() + ']</span>' +
  '<div>' + esc(g.suggestedAction) + '</div>' +
  (g.canSafelyAdd ? '<div style="font-size:7.5pt;color:#16a34a">✓ Safe to add if you have this experience</div>' : '') +
'</div>').join('') : '<div style="font-size:9pt;color:#666;font-style:italic">No significant gaps identified.</div>'}

<div class="section-title">Experience Changes</div>
${tailoredResume.tailoredExperience.map(exp =>
'<div class="diff-item">' +
  '<div class="diff-company">' + esc(exp.company) + '</div>' +
  '<div class="diff-title">' + esc(exp.title) + '</div>' +
  exp.bullets.map(b =>
    '<div class="diff-bullet"><strong>Original:</strong> ' + esc(b.original) + '</div>' +
    '<div class="diff-bullet"><strong>Tailored:</strong> ' + esc(b.tailored) + '</div>' +
    (b.changeReason ? '<div class="diff-change">Why: ' + esc(b.changeReason) + '</div>' : '') +
    (b.riskFlag ? '<div class="diff-change" style="color:#dc2626">⚠ ' + esc(b.riskFlag) + '</div>' : '')
  ).join('') +
'</div>').join('')}

<div class="page-break"></div>

<div class="section-title">Full Original Resume</div>
${resume.summary ? '<p style="font-size:9pt;margin-bottom:4pt"><strong>Summary:</strong> ' + esc(resume.summary) + '</p>' : ''}
${resume.experience.map(exp =>
'<div class="diff-item">' +
  '<div class="diff-company">' + esc(exp.company) + '</div>' +
  '<ul style="margin:2pt 0 0 14pt;font-size:8.5pt">' + exp.bullets.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' +
'</div>').join('')}

<div class="section-title">Full Tailored Resume</div>
${tailoredResume.tailoredSummary ? '<p style="font-size:9pt;margin-bottom:4pt"><strong>Summary:</strong> ' + esc(tailoredResume.tailoredSummary) + '</p>' : ''}
${tailoredResume.tailoredExperience.map(exp =>
'<div class="diff-item">' +
  '<div class="diff-company">' + esc(exp.company) + '</div>' +
  '<ul style="margin:2pt 0 0 14pt;font-size:8.5pt">' + exp.bullets.map(b => '<li>' + esc(b.tailored) + '</li>').join('') + '</ul>' +
'</div>').join('')}

<div class="disclaimer">
  <strong>Truthfulness Disclaimer:</strong> This tool suggests improvements based on an AI analysis. All changes have been reviewed to preserve your actual experience. <strong>Do not include skills, experience, or qualifications you do not actually have.</strong> Low-confidence or risk-flagged changes are marked above. This tool does not guarantee ATS performance or interview calls.
</div>

</body>
</html>`;
  }
}
