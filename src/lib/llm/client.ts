import Groq from "groq-sdk";
import { cacheGet, cacheSet, getCacheKey } from "./cache";

export class LLMError extends Error {
  code: string;
  constructor(message: string, code = "LLM_ERROR") {
    super(message);
    this.code = code;
    this.name = "LLMError";
  }
}

let _groq: Groq | null = null;

function getGroqClient(): Groq {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new LLMError(
        "GROQ_API_KEY environment variable is not set. Create a .env.local file with GROQ_API_KEY=gsk_your_key_here",
        "MISSING_API_KEY"
      );
    }
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

interface LLMOptions {
  model?: string;
  temperature?: number;
  maxRetries?: number;
}

const DEFAULT_OPTIONS: LLMOptions = {
  model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  temperature: 0.1,
  maxRetries: 3,
};

const FAST_MODEL = process.env.GROQ_MODEL_FAST || "llama-3.1-8b-instant";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callLLM<T>(
  prompt: string,
  schema: { parse: (data: unknown) => T },
  options: LLMOptions = {}
): Promise<{ data: T; cached: boolean }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const cacheKey = getCacheKey(prompt, opts.model || "");

  // Check cache
  const cached = cacheGet<T>(cacheKey);
  if (cached !== null) {
    return { data: cached, cached: true };
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= (opts.maxRetries || 1); attempt++) {
    try {
      const response = await getGroqClient().chat.completions.create({
        model: opts.model || DEFAULT_OPTIONS.model!,
        messages: [
          {
            role: "system",
            content:
              "You are a resume tailoring assistant. You must ALWAYS respond with valid JSON only. No markdown, no explanation, just JSON.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: opts.temperature ?? 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new LLMError("Empty response from LLM");
      }

      const parsed = JSON.parse(content);
      const validated = schema.parse(parsed);

      // Cache the result
      cacheSet(cacheKey, validated);

      return { data: validated, cached: false };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if it's a validation error or auth error
      if (error instanceof LLMError || lastError.message.includes("401") || lastError.message.includes("auth")) {
        throw lastError;
      }

      if (attempt < (opts.maxRetries || 1)) {
        const delay = Math.pow(2, attempt) * 1000;
        await sleep(delay);
      }
    }
  }

  throw lastError || new LLMError("LLM call failed after retries");
}

export { FAST_MODEL };
