import { supabase } from '../../config/supabase';
import { logger } from '../../services/logging';

export interface DeleteOptions {
  bucket: 'public' | 'pdfs';
  path: string;
}

export async function deleteFile({ bucket, path }: DeleteOptions): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    logger.error('Failed to delete file:', error);
    throw new Error('Failed to delete file');
  }
}