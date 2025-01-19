import { StorageConfig } from './types';

export const storageConfig: StorageConfig = {
  maxSizeMB: 5,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  programImages: {
    path: 'programs',
    maxWidth: 1200,
    maxHeight: 800
  }
};