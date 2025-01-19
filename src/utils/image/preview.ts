import { logger } from '../../services/logging';

export interface PreviewOptions {
  maxWidth?: number;
  maxHeight?: number;
}

export function createImagePreview(file: File, options: PreviewOptions = {}): string {
  try {
    return URL.createObjectURL(file);
  } catch (error) {
    logger.error('Failed to create image preview:', error);
    throw new Error('Failed to create image preview');
  }
}

export function revokeImagePreview(url: string): void {
  try {
    URL.revokeObjectURL(url);
  } catch (error) {
    logger.error('Failed to revoke image preview:', error);
  }
}