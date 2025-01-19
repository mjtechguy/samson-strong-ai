import React from 'react';
import { logger } from '../../services/logging';
import { FALLBACK_IMAGES } from '../../constants/images';

interface ProgramImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProgramImage: React.FC<ProgramImageProps> = ({ 
  src, 
  alt, 
  className = ''
}) => {
  const [error, setError] = React.useState(false);

  if (!src || error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <img 
          src={FALLBACK_IMAGES.PROGRAM}
          alt={alt}
          className={className}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        logger.warn('Failed to load program image:', e);
        setError(true);
      }}
    />
  );
};