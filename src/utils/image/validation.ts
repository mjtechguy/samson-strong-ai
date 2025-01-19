import { logger } from '../../services/logging';

export interface ImageValidationOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

const DEFAULT_OPTIONS: ImageValidationOptions = {
  maxSizeBytes: 20 * 1024 * 1024, // 20MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
};

export function validateImage(file: File, options: ImageValidationOptions = {}): void {
  const { maxSizeBytes, allowedTypes } = { ...DEFAULT_OPTIONS, ...options };

  if (!file) {
    throw new Error('No file provided');
  }

  // Check file size
  if (maxSizeBytes && file.size > maxSizeBytes) {
    const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
    const error = `File size exceeds ${maxSizeMB}MB limit`;
    logger.error(error, { fileSize: file.size });
    throw new Error(error);
  }

  // Check file type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    const error = `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }
}