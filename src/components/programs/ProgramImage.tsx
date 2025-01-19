import React from 'react';
import { logger } from '../../services/logging';
import { FALLBACK_IMAGES } from '../../constants/images';

interface ProgramImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackType?: keyof typeof FALLBACK_IMAGES;
}

export const ProgramImage: React.FC<ProgramImageProps> = ({ 
  src, 
  alt, 
  className = '',
  fallbackType = 'PROGRAM'
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState(src || FALLBACK_IMAGES[fallbackType]);

  React.useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      // If no source provided, use fallback immediately
      if (!src) {
        if (isMounted) {
          setImageSrc(FALLBACK_IMAGES[fallbackType]);
          setError(true);
          setIsLoading(false);
        }
        return;
      }

      // Handle Firebase URLs gracefully
      if (src.includes('firebasestorage.googleapis.com')) {
        if (isMounted) {
          setImageSrc(FALLBACK_IMAGES[fallbackType]);
          setError(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        // Validate URL format
        new URL(src);

        // Create image object
        const img = new Image();
        img.crossOrigin = 'anonymous';

        // Set up load handlers
        const loadPromise = new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
        });

        // Set up timeout
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Image load timeout')), 10000)
        );

        // Start loading
        img.src = src;

        // Wait for load or timeout
        await Promise.race([loadPromise, timeoutPromise]);

        if (isMounted) {
          setImageSrc(src);
          setError(false);
          setIsLoading(false);
        }
      } catch (error) {
        logger.warn('Failed to load image, using fallback', { 
          src, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        if (isMounted) {
          setImageSrc(FALLBACK_IMAGES[fallbackType]);
          setError(true);
          setIsLoading(false);
        }
      }
    };

    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [src, fallbackType]);

  return (
    <>
      {isLoading && (
        <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
          <div className="animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => {
          setImageSrc(FALLBACK_IMAGES[fallbackType]);
          setError(true);
          setIsLoading(false);
        }}
        loading="lazy"
        crossOrigin="anonymous"
      />
    </>
  );
};