export const RESUME_PARSER_PROMPT = `You are a resume parser. Convert the following raw resume text into a structured JSON format.

RULES:
- Extract logical sections: contact info, summary, skills, work experience, projects, education, certifications
- For work experience, extract company, title, dates, and bullet points
- Map non-standard section names to standard ones (e.g., "Professional Journey" → "experience")
- If a section is missing, use an empty array or null
- Preserve all factual information exactly as written
- Do not add, edit, or enhance any content
- Detect language if not English and add "language" field
- Return ONLY valid JSON with no markdown

Resume Text:
{{RESUME_TEXT}}

Return JSON matching this exact schema:
{
  "contact": {
    "name": "string or omitted",
    "email": "string or omitted",
    "phone": "string or omitted",
    "location": "string or omitted",
    "linkedin": "string or omitted",
    "portfolio": "string or omitted"
  },
  "summary": "string - professional summary or empty string",
  "skills": ["string - each skill"],
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string or omitted",
      "endDate": "string or omitted",
      "bullets": ["string - each bullet point"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string or omitted",
      "technologies": ["string"] or omitted
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string or omitted",
      "startDate": "string or omitted",
      "endDate": "string or omitted",
      "gpa": "string or omitted"
    }
  ],
  "certifications": ["string - each certification"],
  "language": "string or omitted"
}`;
