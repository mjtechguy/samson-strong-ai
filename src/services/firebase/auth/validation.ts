import { z } from 'zod';

export const authValidationSchema = {
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional()
};

export const validateAuthCredentials = (credentials: { 
  email: string; 
  password: string; 
  name?: string;
}): void => {
  const schema = z.object(authValidationSchema);
  schema.parse(credentials);
};