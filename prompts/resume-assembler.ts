export const RESUME_ASSEMBLER_PROMPT = `You are a resume assembler. Combine rewritten sections into a complete, coherent tailored resume.

Input:
- Original resume structure (with original summary, skills, experience)
- Rewritten summary
- Reordered skills list
- Rewritten experience bullets

Instructions:
- Preserve the original section order
- Preserve education, projects, and certifications as-is (these are not rewritten)
- Combine the rewritten summary, reordered skills, and rewritten experience into one complete structure
- Ensure the output has the same company names, job titles, and dates as the original
- Return ONLY valid JSON matching the schema

Original Resume:
{{RESUME_JSON}}

Rewritten Summary:
{{REWRITTEN_SUMMARY}}

Reordered Skills:
{{REORDERED_SKILLS}}

Rewritten Experience (array of company experience with bullets):
{{REWRITTEN_EXPERIENCE}}

Return JSON matching TailoredResumeSchema:
{
  "tailoredSummary": "...",
  "tailoredSkills": ["..."],
  "tailoredExperience": [
    {
      "company": "...",
      "title": "...",
      "bullets": [
        {
          "original": "...",
          "tailored": "...",
          "changeReason": "...",
          "keywordsAddressed": ["..."],
          "confidence": "high",
          "riskFlag": ""
        }
      ]
    }
  ],
  "tailoredProjects": [
    {
      "name": "...",
      "description": "...",
      "technologies": ["..."]
    }
  ]
}`;
