import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../core';
import { UploadOptions, UploadResult } from './types';
import { logger } from '../../logging';

export const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<UploadResult> => {
  try {
    logger.debug('Uploading file', { path: options.path });

    const storageRef = ref(storage, options.path);
    const metadata = {
      contentType: options.contentType || file.type,
      customMetadata: options.metadata
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const url = await getDownloadURL(snapshot.ref);

    logger.debug('File uploaded successfully', { path: options.path, url });

    return {
      url,
      path: options.path,
      metadata: options.metadata
    };
  } catch (error) {
    logger.error('Failed to upload file', { error, path: options.path });
    throw new Error('Failed to upload file');
  }
};