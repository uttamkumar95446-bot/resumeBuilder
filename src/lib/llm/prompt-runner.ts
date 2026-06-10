import { callLLM, FAST_MODEL } from "./client";
import type { z } from "zod";

interface PromptRunnerOptions {
  useFastModel?: boolean;
  temperature?: number;
}

export async function runPrompt<T>(
  prompt: string,
  schema: z.ZodType<T>,
  options: PromptRunnerOptions = {}
): Promise<{ data: T; cached: boolean }> {
  return callLLM(prompt, schema, {
    model: options.useFastModel ? FAST_MODEL : undefined,
    temperature: options.temperature,
  });
}
