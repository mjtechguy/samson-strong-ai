export interface ImageDimensions {
  width: number;
  height: number;
}

export const getImageDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  aspectRatio?: number
): ImageDimensions => {
  let width = Math.min(maxWidth, originalWidth);
  let height: number;

  if (aspectRatio) {
    // Force specific aspect ratio (e.g., 16:9)
    height = Math.round(width / aspectRatio);
  } else {
    // Maintain original aspect ratio
    const originalAspectRatio = originalWidth / originalHeight;
    height = Math.round(width / originalAspectRatio);
  }

  return { width, height };
};

export const get16by9Dimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number
): ImageDimensions => {
  return getImageDimensions(originalWidth, originalHeight, maxWidth, 16/9);
};