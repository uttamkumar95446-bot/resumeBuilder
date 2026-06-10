import { runPrompt } from '@/lib/llm/prompt-runner';
import { JobDescriptionProfileSchema, type JobDescriptionProfile } from '@/lib/schemas/job-description';
import { JD_EXTRACTION_PROMPT } from '../../../prompts/jd-extraction';

export interface JDParserResult {
  jd: JobDescriptionProfile;
  warnings: string[];
}

export async function parseJD(text: string): Promise<JDParserResult> {
  if (!text || text.trim().length < 50) {
    return {
      jd: {
        jobTitle: '',
        company: null,
        requiredSkills: [],
        preferredSkills: [],
        responsibilities: [],
        qualifications: [],
        tools: [],
        keywords: [],
        seniorityLevel: null,
        domainSignals: [],
        softSkills: [],
      },
      warnings: ['JD text is too short. Minimum 50 characters required.'],
    };
  }

  const prompt = JD_EXTRACTION_PROMPT.replace('{{JD_TEXT}}', text.slice(0, 15000));

  try {
    const { data } = await runPrompt(prompt, JobDescriptionProfileSchema);
    return { jd: data, warnings: [] };
  } catch (error) {
    return {
      jd: {
        jobTitle: '',
        company: null,
        requiredSkills: [],
        preferredSkills: [],
        responsibilities: [],
        qualifications: [],
        tools: [],
        keywords: [],
        seniorityLevel: null,
        domainSignals: [],
        softSkills: [],
      },
      warnings: [`Failed to parse job description: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}
