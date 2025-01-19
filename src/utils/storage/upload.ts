import { supabase } from '../../config/supabase';
import { logger } from '../../services/logging';
import { validateImage } from '../image/validation';
import { compressImage } from '../image/compression';

export interface UploadOptions {
  bucket: 'public' | 'pdfs';
  path: string;
  metadata?: Record<string, string>;
  compress?: boolean;
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<{ path: string; url: string }> {
  try {
    // Validate file
    validateImage(file, {
      maxSizeBytes: options.maxSizeBytes,
      allowedTypes: options.allowedTypes
    });

    // Compress image if needed
    let fileToUpload = file;
    if (options.compress && file.size > 1024 * 1024) {
      const compressedBlob = await compressImage(file);
      fileToUpload = new File([compressedBlob], file.name, { type: compressedBlob.type });
    }

    // Upload file
    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(options.path, fileToUpload, {
        upsert: true,
        contentType: fileToUpload.type,
        cacheControl: '3600',
        metadata: {
          ...options.metadata,
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      });

    if (error) throw error;
    if (!data) throw new Error('No data returned from upload');

    // Get URL
    const { data: urlData } = supabase.storage
      .from(options.bucket)
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get file URL');
    }

    return {
      path: data.path,
      url: urlData.publicUrl
    };
  } catch (error) {
    logger.error('File upload failed:', error);
    throw error;
  }
}