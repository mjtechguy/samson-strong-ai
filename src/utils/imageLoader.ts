import { logger } from '../services/logging';

export const loadImage = async (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      logger.debug('Image loaded successfully', { url });
      resolve(img);
    };
    
    img.onerror = (error) => {
      logger.error('Failed to load image', { url, error });
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

export const getImageDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  aspectRatio?: number
): { width: number; height: number } => {
  let width = Math.min(maxWidth, originalWidth);
  let height: number;

  if (aspectRatio) {
    // Force specific aspect ratio
    height = width / aspectRatio;
  } else {
    // Maintain original aspect ratio
    const originalAspectRatio = originalWidth / originalHeight;
    height = width / originalAspectRatio;
  }

  return { width, height };
};