import { storageConfig } from './config';
import { logger } from '../logging';

export const validateFile = (file: File): void => {
  if (!file) {
    const error = 'No file provided';
    logger.error(error);
    throw new Error(error);
  }

  // Check file size
  const maxSizeBytes = 20 * 1024 * 1024; // 20MB limit
  if (file.size > maxSizeBytes) {
    const error = `File size exceeds 20MB limit`;
    logger.error(error, { fileSize: file.size });
    throw new Error(error);
  }

  // Check file type for images
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    const error = `Invalid file type: ${file.type}. Allowed types: ${storageConfig.allowedImageTypes.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }
};