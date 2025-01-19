import { loadImage } from '../../image/loader';
import { getImageDimensions } from '../../image/dimensions';
import { logger } from '../../../services/logging';

export interface ImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
}

export async function loadAndProcessImage(
  url: string,
  options: ImageOptions = {}
): Promise<{ image: HTMLImageElement; width: number; height: number }> {
  try {
    const img = await loadImage(url);
    const { width, height } = getImageDimensions(
      img.width,
      img.height,
      options.maxWidth || img.width,
      options.aspectRatio
    );

    return { image: img, width, height };
  } catch (error) {
    logger.error('Failed to load and process image:', error);
    throw new Error('Failed to process image');
  }
}