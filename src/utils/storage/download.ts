import { supabase } from '../../config/supabase';
import { logger } from '../../services/logging';

export interface DownloadOptions {
  bucket: 'public' | 'pdfs';
  path: string;
  filename?: string;
}

export async function downloadFile({ bucket, path, filename }: DownloadOptions): Promise<void> {
  try {
    // Get download URL
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) throw error;
    if (!data?.signedUrl) throw new Error('Failed to get download URL');

    // Create and click download link
    const link = document.createElement('a');
    link.href = data.signedUrl;
    link.download = filename || path.split('/').pop() || 'download';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    logger.error('Failed to download file:', error);
    throw new Error('Failed to download file');
  }
}