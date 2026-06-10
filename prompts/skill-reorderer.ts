export const SKILL_REORDERER_PROMPT = `You are a skills reorderer. Reorder a list of skills to prioritize those most relevant to a target job description.

RULES:
- Only reorder — do NOT add new skills
- Put the most JD-relevant skills first
- Keep the total list the same length
- If a skill from the JD is missing from the resume, do NOT add it
- The order should be: most relevant to least relevant for this specific role

Original Skills:
{{ORIGINAL_SKILLS}}

Job Description Required Skills:
{{JD_REQUIRED_SKILLS}}

Job Description Preferred Skills:
{{JD_PREFERRED_SKILLS}}

Return ONLY the reordered skills array as JSON: ["skill1", "skill2", ...]
`;
