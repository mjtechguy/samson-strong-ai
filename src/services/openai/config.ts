import { z } from 'zod';

const configSchema = z.object({
  apiKey: z.string().min(1),
  model: z.string().min(1),
  systemPrompt: z.string().min(1),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).default(16384),
  maxContextTokens: z.number().min(1).default(128000),
});

const config = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  model: import.meta.env.VITE_OPENAI_MODEL,
  systemPrompt: import.meta.env.VITE_AI_SYSTEM_PROMPT,
  temperature: 0.7,
  maxTokens: 16384,
  maxContextTokens: 128000,
};

export const openAIConfig = configSchema.parse(config);