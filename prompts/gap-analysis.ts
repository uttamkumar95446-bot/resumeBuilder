export const GAP_ANALYSIS_PROMPT = `You are a gap analyst. Identify skills, tools, or qualifications present in a job description but missing or weakly represented in a resume.

Instructions:
- Focus on skills and requirements that are explicitly mentioned in the JD
- For each gap, specify importance: high (required skill missing), medium (preferred skill missing or weakly covered), or low (nice-to-have)
- Provide evidence from the JD showing where the gap originates
- Note what the resume currently shows (or doesn't show)
- Suggest an actionable step for the user
- Set canSafelyAdd to true only if the user likely has this experience but didn't list it

Resume Profile:
{{RESUME_JSON}}

Job Description Profile:
{{JD_JSON}}

Return JSON:
{
  "gaps": [
    {
      "name": "...",
      "importance": "high | medium | low",
      "jdEvidence": "...",
      "resumeEvidence": "...",
      "suggestedAction": "...",
      "canSafelyAdd": true
    }
  ]
}

Suggested actions should be one of: "Add if you have this experience", "Leave out if not true", "Mention in skills section if familiar", "Add a project bullet if applicable", "Prepare to address this in interview"
`;
