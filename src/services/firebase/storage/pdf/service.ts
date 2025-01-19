import { supabase } from '../../../../config/supabase';
import { logger } from '../../../logging';
import { v4 as uuidv4 } from 'uuid';

export class PDFStorageService {
  private basePath = 'pdfs';

  async uploadPDF(blob: Blob, userId: string, programId: string): Promise<{ url: string; path: string }> {
    try {
      const filename = `${programId}-${uuidv4()}.pdf`;
      const path = `${this.basePath}/${userId}/${filename}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from('private')
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

      if (error) throw error;
      if (!data) throw new Error('No data returned from upload');

      // Get signed URL
      const { data: { signedUrl }, error: urlError } = await supabase.storage
        .from('private')
        .createSignedUrl(data.path, 3600); // 1 hour expiry

      if (urlError) throw urlError;
      if (!signedUrl) throw new Error('Failed to get signed URL');

      logger.debug('PDF uploaded successfully', { path, url: signedUrl });
      return { url: signedUrl, path: data.path };
    } catch (error) {
      logger.error('Failed to upload PDF', error);
      throw new Error('Failed to upload PDF');
    }
  }

  async getPDFUrl(path: string): Promise<string> {
    try {
      logger.debug('Getting PDF URL', { path });
      const { data: { signedUrl }, error } = await supabase.storage
        .from('private')
        .createSignedUrl(path, 3600);

      if (error) throw error;
      if (!signedUrl) throw new Error('Failed to get signed URL');

      return signedUrl;
    } catch (error) {
      logger.error('Failed to get PDF URL', error);
      throw new Error('Failed to get PDF URL');
    }
  }
}

export const pdfStorage = new PDFStorageService();