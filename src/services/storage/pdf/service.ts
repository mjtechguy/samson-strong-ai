import { supabase } from '../../../config/supabase';
import { logger } from '../../logging';
import { v4 as uuidv4 } from 'uuid';

export class PDFStorageService {
  private basePath = 'pdfs';
  private readonly MAX_SIZE = 20 * 1024 * 1024; // 20MB
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  async uploadPDF(blob: Blob, userId: string, programId: string): Promise<{ url: string; path: string }> {
    try {
      // Validate blob
      if (!(blob instanceof Blob)) {
        logger.error('Invalid PDF format', { type: blob?.type });
        throw new Error('Invalid PDF format');
      }

      // Check file size
      if (blob.size > this.MAX_SIZE) {
        logger.error('PDF file too large', { 
          size: blob.size, 
          maxSize: this.MAX_SIZE,
          sizeInMB: Math.round(blob.size / (1024 * 1024))
        });
        throw new Error('PDF file is too large. Maximum size is 20MB.');
      }

      // Create path with timestamp to avoid conflicts
      const timestamp = Date.now();
      const path = `${userId}/${timestamp}-${uuidv4()}.pdf`;

      logger.debug('Uploading PDF', { 
        path,
        size: blob.size,
        sizeInMB: Math.round(blob.size / (1024 * 1024)),
        type: blob.type
      });

      // Upload with retries
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
        try {
          const { data, error } = await supabase.storage
            .from(this.basePath)
            .upload(path, blob, {
              contentType: 'application/pdf',
              cacheControl: '3600',
              upsert: true,
              metadata: {
                userId,
                programId,
                createdAt: new Date().toISOString()
              }
            });

          if (error) {
            if (error.message?.includes('Payload Too Large')) {
              logger.error('PDF upload failed - file too large', {
                size: blob.size,
                maxSize: this.MAX_SIZE,
                sizeInMB: Math.round(blob.size / (1024 * 1024))
              });
              throw new Error('PDF file is too large. Maximum size is 20MB.');
            }
            throw error;
          }

          if (!data) throw new Error('No data returned from upload');

          // Get signed URL
          const { data: { signedUrl }, error: urlError } = await supabase.storage
            .from(this.basePath)
            .createSignedUrl(data.path, 3600); // 1 hour expiry

          if (urlError) throw urlError;
          if (!signedUrl) throw new Error('Failed to get signed URL');

          logger.debug('PDF uploaded successfully', { 
            path: data.path, 
            url: signedUrl,
            size: blob.size,
            sizeInMB: Math.round(blob.size / (1024 * 1024))
          });

          return { url: signedUrl, path: data.path };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          
          if (error instanceof Error && error.message.includes('too large')) {
            throw error; // Don't retry size errors
          }

          if (attempt < this.MAX_RETRIES) {
            logger.warn(`Upload attempt ${attempt} failed, retrying...`, { 
              error: lastError,
              attempt,
              maxRetries: this.MAX_RETRIES
            });
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
            continue;
          }
        }
      }
      
      throw lastError || new Error('Failed to upload PDF after multiple attempts');
    } catch (error) {
      logger.error('Failed to upload PDF', {
        error,
        userId,
        programId,
        blobSize: blob.size,
        blobType: blob.type
      });
      if (error instanceof Error) throw error;
      throw new Error('Failed to upload PDF. Please try again.');
    }
  }

  async getPDFUrl(path: string): Promise<string> {
    try {
      logger.debug('Getting PDF URL', { path });

      // Input validation
      if (!path?.trim()) {
        logger.error('Invalid PDF path', { path });
        throw new Error('PDF path is required');
      }

      // First verify file exists
      const { data: fileData, error: fileError } = await supabase.storage
        .from(this.basePath)
        .list(path.split('/')[0], {
          limit: 1,
          search: path.split('/')[1]
        });

      if (fileError) {
        logger.error('Failed to verify PDF exists:', { error: fileError, path });
        throw new Error('Failed to verify PDF file exists');
      }

      if (!fileData?.length) {
        logger.error('PDF file not found', { path });
        throw new Error('PDF file not found');
      }

      // Get signed URL with retry
      let signedUrl: string | null = null;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
        try {
          const { data, error } = await supabase.storage
            .from(this.basePath)
            .createSignedUrl(path, 3600); // 1 hour expiry

          if (error) throw error;
          if (!data?.signedUrl) throw new Error('No signed URL returned');

          signedUrl = data.signedUrl;
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Failed to get signed URL');
          logger.warn(`Failed to get signed URL attempt ${attempt}`, { error: lastError });
          
          if (attempt < this.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
            continue;
          }
        }
      }

      if (!signedUrl) {
        throw lastError || new Error('Failed to get download URL');
      }

      logger.debug('PDF URL generated successfully', { path });
      return signedUrl;
    } catch (error) {
      logger.error('Failed to get PDF URL:', { error, path });
      if (error instanceof Error) throw error;
      throw new Error('Failed to get download URL');
    }
  }
}

// Create and export singleton instance
export const pdfStorage = new PDFStorageService();