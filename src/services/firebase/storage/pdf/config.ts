import { z } from 'zod';

export const pdfConfig = {
  basePath: 'pdfs',
  maxSizeMB: 10,
  allowedTypes: ['application/pdf'],
  validationSchema: z.object({
    userId: z.string().min(1),
    programName: z.string().min(1),
    programId: z.string().min(1)
  }),
  storage: {
    metadata: {
      cacheControl: 'private, max-age=3600',
      contentType: 'application/pdf'
    }
  }
} as const;