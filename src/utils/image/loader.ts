import { preloadImage } from './cache';
import { logger } from '../../services/logging';
import { FALLBACK_IMAGES } from '../../constants/images';

export const loadImage = async (url: string): Promise<HTMLImageElement> => {
  try {
    logger.debug('Loading image', { url });

    // Return early if no URL provided
    if (!url?.trim()) {
      logger.warn('No image URL provided');
      throw new Error('No image URL provided');
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      logger.error('Invalid image URL', { url });
      throw new Error('Invalid image URL');
    }

    // Handle Firebase URLs gracefully
    if (url.includes('firebasestorage.googleapis.com')) {
      logger.warn('Firebase Storage URL detected, using fallback image', { url });
      return preloadImage(FALLBACK_IMAGES.PROGRAM);
    }

    // Load image with timeout
    const img = await Promise.race([
      preloadImage(url),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Image load timeout')), 10000)
      )
    ]);
    
    logger.debug('Image loaded successfully', { 
      url,
      width: img.width,
      height: img.height,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight
    });

    return img;
  } catch (error) {
    logger.error('Failed to load image', { 
      url, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    });

    // Return fallback image instead of throwing
    return preloadImage(FALLBACK_IMAGES.PROGRAM);
  }
};