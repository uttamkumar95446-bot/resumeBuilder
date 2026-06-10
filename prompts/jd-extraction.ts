export const JD_EXTRACTION_PROMPT = `You are a job description analyzer. Extract structured information from the following job description.

RULES:
- Extract all technical and non-technical skills mentioned
- Distinguish "required" skills from "preferred/nice-to-have" skills
- Tools and platforms should go in the "tools" array
- Seniority level must be one of: entry, mid, senior, lead, manager, director
- If company name is present, extract it; otherwise return null
- Extract domain-specific keywords and terminology
- Extract soft skills and behavioral signals only when explicitly mentioned
- Return ONLY valid JSON with no markdown

Job Description:
{{JD_TEXT}}

Return JSON matching this exact schema:
{
  "jobTitle": "string - the job title",
  "company": "string or null - the company name if present",
  "requiredSkills": ["string - skills listed as required or mandatory"],
  "preferredSkills": ["string - skills listed as preferred, nice-to-have, or a plus"],
  "responsibilities": ["string - key responsibilities mentioned"],
  "qualifications": ["string - educational or experience requirements"],
  "tools": ["string - tools, platforms, and technologies mentioned"],
  "keywords": ["string - domain-specific keywords and terminology"],
  "seniorityLevel": "entry|mid|senior|lead|manager|director or null",
  "domainSignals": ["string - domain or industry signals"],
  "softSkills": ["string - soft skills explicitly mentioned"]
}`;
