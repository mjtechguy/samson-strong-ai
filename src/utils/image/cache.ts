import { logger } from '../../services/logging';

const imageCache = new Map<string, HTMLImageElement>();

export const preloadImage = async (url: string): Promise<HTMLImageElement> => {
  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const cleanup = () => {
      clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
    };
    
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Image load timeout'));
    }, 10000);
    
    img.onload = () => {
      cleanup();
      imageCache.set(url, img);
      logger.debug('Image loaded and cached', { url });
      resolve(img);
    };
    
    img.onerror = () => {
      cleanup();
      logger.error('Failed to load image', { url });
      reject(new Error('Failed to load image'));
    };
    
    // Add cache busting for Firebase Storage URLs
    const urlWithCache = url.includes('firebasestorage.googleapis.com') 
      ? `${url}&_cb=${Date.now()}`
      : url;
    
    img.src = urlWithCache;
  });
};

export const clearImageCache = () => {
  imageCache.clear();
  logger.debug('Image cache cleared');
};