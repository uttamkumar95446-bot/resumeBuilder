import { runPrompt } from '@/lib/llm/prompt-runner';
import { ResumeProfileSchema, type ResumeProfile } from '@/lib/schemas/resume';
import { RESUME_PARSER_PROMPT } from '../../../prompts/resume-parser';

export interface ParseResult {
  resume: ResumeProfile;
  warnings: string[];
}

export async function parseResume(text: string): Promise<ParseResult> {
  if (!text || text.trim().length < 50) {
    return {
      resume: {
        skills: [],
        experience: [],
        projects: [],
        education: [],
        certifications: [],
      },
      warnings: ['Resume text is too short. Minimum 50 characters required.'],
    };
  }

  const prompt = RESUME_PARSER_PROMPT.replace('{{RESUME_TEXT}}', text.slice(0, 15000));
  
  try {
    const { data } = await runPrompt(prompt, ResumeProfileSchema);
    return { resume: data, warnings: [] };
  } catch (error) {
    return {
      resume: {
        skills: [],
        experience: [],
        projects: [],
        education: [],
        certifications: [],
      },
      warnings: [`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}
