import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../../core';
import { PDFMetadata, PDFUploadResult } from './types';
import { generatePDFPath } from './utils';
import { pdfConfig } from './config';
import { logger } from '../../../logging';

export class PDFRepository {
  async upload(blob: Blob, metadata: PDFMetadata): Promise<PDFUploadResult> {
    try {
      const path = generatePDFPath(metadata);
      logger.debug('Uploading PDF', { path, metadata });

      // Create storage reference
      const storageRef = ref(storage, path);

      // Prepare metadata
      const uploadMetadata = {
        contentType: 'application/pdf',
        customMetadata: {
          userId: metadata.userId,
          programName: metadata.programName,
          programId: metadata.programId,
          createdAt: new Date().toISOString()
        },
        cacheControl: 'private, max-age=3600'
      };

      // Upload file
      const snapshot = await uploadBytes(storageRef, blob, uploadMetadata);
      const url = await getDownloadURL(snapshot.ref);

      logger.debug('PDF uploaded successfully', { path, url });

      return {
        url,
        path,
        metadata: uploadMetadata.customMetadata
      };
    } catch (error) {
      logger.error('Failed to upload PDF', { error, metadata });
      throw new Error('Failed to upload PDF');
    }
  }

  async download(path: string): Promise<Blob> {
    try {
      logger.debug('Downloading PDF', { path });
      
      // Get download URL
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      
      // Download file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Validate content type
      const contentType = response.headers.get('content-type');
      if (!contentType || contentType !== 'application/pdf') {
        throw new Error('Invalid PDF content type');
      }

      const blob = await response.blob();
      logger.debug('PDF downloaded successfully', { path });
      
      return blob;
    } catch (error) {
      logger.error('Failed to download PDF', { error, path });
      throw new Error('Failed to download PDF');
    }
  }

  async getUrl(path: string): Promise<string> {
    try {
      logger.debug('Getting PDF URL', { path });
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      logger.debug('PDF URL retrieved successfully', { path });
      return url;
    } catch (error) {
      logger.error('Failed to get PDF URL', { error, path });
      throw new Error('Failed to get PDF URL');
    }
  }

  async listUserPDFs(userId: string): Promise<string[]> {
    try {
      logger.debug('Listing user PDFs', { userId });
      const userPDFsRef = ref(storage, `${pdfConfig.basePath}/${userId}`);
      const result = await listAll(userPDFsRef);
      const paths = result.items.map(item => item.fullPath);
      logger.debug('User PDFs listed successfully', { userId, count: paths.length });
      return paths;
    } catch (error) {
      logger.error('Failed to list user PDFs', { error, userId });
      throw new Error('Failed to list user PDFs');
    }
  }
}