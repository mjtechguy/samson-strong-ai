import { storageConfig } from './config';
import { logger } from '../../logging';

export const validateFile = (file: File): void => {
  if (!file) {
    const error = 'No file provided';
    logger.error(error);
    throw new Error(error);
  }

  // Check file size
  const maxSizeBytes = storageConfig.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    const error = `File size exceeds ${storageConfig.maxSizeMB}MB limit`;
    logger.error(error, { fileSize: file.size });
    throw new Error(error);
  }

  // Check file type for images
  if (!storageConfig.allowedImageTypes.includes(file.type)) {
    const error = `Invalid file type: ${file.type}. Allowed types: ${storageConfig.allowedImageTypes.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }
};