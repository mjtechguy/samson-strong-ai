import { supabase } from '../../config/supabase';
import { UploadResult, UploadProfileImageOptions, UploadProgramImageOptions } from './types';
import { validateFile } from './validation';
import { logger } from '../logging';

export class StorageService {
  async uploadProfileImage({ file, userId }: UploadProfileImageOptions): Promise<UploadResult> {
    try {
      logger.debug('Uploading profile image', { userId });

      // Validate file
      validateFile(file);

      // Generate unique filename
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const filename = `profile-${timestamp}.${extension}`;
      const path = `users/${userId}/profile/${filename}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from('public')
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600',
          metadata: {
            userId,
            type: 'profile',
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        });

      if (error) throw error;
      if (!data) throw new Error('No data returned from upload');

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get file URL');
      }

      logger.debug('Profile image uploaded successfully', { 
        path: data.path, 
        url: urlData.publicUrl 
      });

      return {
        path: data.path,
        url: urlData.publicUrl
      };
    } catch (error) {
      logger.error('Profile image upload failed:', error);
      throw error;
    }
  }

  async uploadImage({ file, programId }: UploadProgramImageOptions): Promise<string> {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const filename = `program-${timestamp}.${extension}`;
      const path = `programs/${programId}/${filename}`;

      const result = await this.uploadFile({
        file,
        path,
        metadata: {
          programId,
          type: 'program'
        }
      });

      return result.url;
    } catch (error) {
      logger.error('Program image upload failed:', error);
      throw error;
    }
  }

  async uploadFile({ file, path, metadata }: {
    file: File;
    path: string;
    metadata?: Record<string, string>;
  }): Promise<UploadResult> {
    try {
      logger.debug('Uploading file', { path });

      // Validate file
      validateFile(file);

      // Upload file
      const { data, error } = await supabase.storage
        .from('public')
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600',
          metadata: {
            ...metadata,
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        });

      if (error) throw error;
      if (!data) throw new Error('No data returned from upload');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(data.path);

      logger.debug('File uploaded successfully', { path, url: publicUrl });

      return {
        url: publicUrl,
        path: data.path,
        metadata
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload file';
      logger.error('File upload failed:', { error, path });
      throw new Error(message);
    }
  }
}

// Create and export singleton instance
export const storageService = new StorageService();
