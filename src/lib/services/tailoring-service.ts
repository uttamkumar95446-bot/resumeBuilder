import { runPrompt } from '@/lib/llm/prompt-runner';
import { callLLM } from '@/lib/llm/client';
import { TailoredResumeSchema, type TailoredResume } from '@/lib/schemas/tailored-resume';
import { BULLET_REWRITER_PROMPT } from '../../../prompts/bullet-rewriter';
import { SUMMARY_REWRITER_PROMPT } from '../../../prompts/summary-rewriter';
import { SKILL_REORDERER_PROMPT } from '../../../prompts/skill-reorderer';
import { RESUME_ASSEMBLER_PROMPT } from '../../../prompts/resume-assembler';
import type { ResumeProfile, JobDescriptionProfile } from '@/types';

interface RewrittenBullet {
  original: string;
  tailored: string;
  changeReason: string;
  keywordsAddressed: string[];
  confidence: 'high' | 'medium' | 'low';
  riskFlag?: string;
}

interface RewrittenCompany {
  company: string;
  title: string;
  bullets: RewrittenBullet[];
}

export async function tailorResume(
  resume: ResumeProfile,
  jd: JobDescriptionProfile
): Promise<TailoredResume> {
  // Step 1: Rewrite summary
  let tailoredSummary = resume.summary || '';
  if (resume.summary) {
    try {
      const summaryPrompt = SUMMARY_REWRITER_PROMPT
        .replace('{{ORIGINAL_SUMMARY}}', resume.summary)
        .replace('{{ORIGINAL_SKILLS}}', JSON.stringify(resume.skills))
        .replace('{{JD_JSON}}', JSON.stringify(jd));
      const summaryResponse = await callLLM(summaryPrompt, {
        parse: (data: unknown) => String(data),
      });
      tailoredSummary = summaryResponse.data as unknown as string;
    } catch {
      tailoredSummary = resume.summary;
    }
  }

  // Step 2: Reorder skills
  let tailoredSkills = resume.skills;
  if (resume.skills.length > 0) {
    try {
      const skillsPrompt = SKILL_REORDERER_PROMPT
        .replace('{{ORIGINAL_SKILLS}}', JSON.stringify(resume.skills))
        .replace('{{JD_REQUIRED_SKILLS}}', JSON.stringify(jd.requiredSkills))
        .replace('{{JD_PREFERRED_SKILLS}}', JSON.stringify(jd.preferredSkills));
      const skillsResponse = await callLLM(skillsPrompt, {
        parse: (data: unknown) => data as string[],
      });
      if (Array.isArray(skillsResponse.data)) {
        tailoredSkills = skillsResponse.data as string[];
      }
    } catch {
      tailoredSkills = resume.skills;
    }
  }

  // Step 3: Rewrite experience bullets per company
  const tailoredExperience: RewrittenCompany[] = [];
  for (const exp of resume.experience) {
    if (exp.bullets.length === 0) {
      tailoredExperience.push({ company: exp.company, title: exp.title, bullets: [] });
      continue;
    }

    try {
      const bulletPrompt = BULLET_REWRITER_PROMPT
        .replace('{{EXPERIENCE_JSON}}', JSON.stringify({
          company: exp.company,
          title: exp.title,
          bullets: exp.bullets,
        }))
        .replace('{{JD_JSON}}', JSON.stringify(jd));
      
      const bulletResponse = await callLLM(bulletPrompt, {
        parse: (data: unknown) => {
          if (Array.isArray(data)) return data;
          throw new Error('Invalid bullet rewrite response');
        },
      });
      const bullets = bulletResponse.data as RewrittenBullet[];
      tailoredExperience.push({ company: exp.company, title: exp.title, bullets });
    } catch {
      // Fall back to original bullets
      tailoredExperience.push({
        company: exp.company,
        title: exp.title,
        bullets: exp.bullets.map((b) => ({
          original: b,
          tailored: b,
          changeReason: 'Rewrite failed — using original',
          keywordsAddressed: [],
          confidence: 'high' as const,
          riskFlag: '',
        })),
      });
    }
  }

  // Step 4: Assemble final resume
  const assemblePrompt = RESUME_ASSEMBLER_PROMPT
    .replace('{{RESUME_JSON}}', JSON.stringify(resume))
    .replace('{{REWRITTEN_SUMMARY}}', tailoredSummary)
    .replace('{{REORDERED_SKILLS}}', JSON.stringify(tailoredSkills))
    .replace('{{REWRITTEN_EXPERIENCE}}', JSON.stringify(tailoredExperience));

  try {
    const { data } = await runPrompt(assemblePrompt, TailoredResumeSchema);
    return data;
  } catch {
    // Fall back to basic assembly
    return {
      tailoredSummary,
      tailoredSkills,
      tailoredExperience,
      tailoredProjects: resume.projects.map((p) => ({
        name: p.name,
        description: p.description,
        technologies: p.technologies,
      })),
    };
  }
}
