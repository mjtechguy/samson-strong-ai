import { z } from 'zod';

export const programYAMLSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string().min(1, 'Description is required'),
  image_url: z.string().url().optional(),
  template: z.string().min(1, 'Template is required'),
  metadata: z.object({
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    duration: z.string().optional(),
    equipment: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional()
  }).optional()
});

export const validateProgramYAML = (data: unknown) => {
  return programYAMLSchema.safeParse(data);
};