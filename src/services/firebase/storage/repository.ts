import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../../config/firebase';
import { UploadFileInput, UploadPDFInput, UploadProgramImageOptions } from './types';
import { logger } from '../../logging';

export class StorageRepository {
  async uploadFile({ file, path }: UploadFileInput): Promise<string> {
    try {
      logger.debug('Uploading file', { path });
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      logger.debug('File uploaded successfully', { url });
      return url;
    } catch (error) {
      logger.error('Failed to upload file', error);
      throw new Error('Failed to upload file');
    }
  }

  async uploadPDF({ pdfBlob, userId, programName }: UploadPDFInput): Promise<string> {
    try {
      const path = `pdfs/${userId}/${programName}-${Date.now()}.pdf`;
      logger.debug('Uploading PDF', { path });
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, pdfBlob);
      const url = await getDownloadURL(snapshot.ref);
      logger.debug('PDF uploaded successfully', { url });
      return url;
    } catch (error) {
      logger.error('Failed to upload PDF', error);
      throw new Error('Failed to upload PDF');
    }
  }

  async uploadProgramImage({ file, programId }: UploadProgramImageOptions): Promise<string> {
    try {
      const extension = file.name.split('.').pop();
      const path = `programs/${programId}/image-${Date.now()}.${extension}`;
      logger.debug('Uploading program image', { path });
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      logger.debug('Program image uploaded successfully', { url });
      return url;
    } catch (error) {
      logger.error('Failed to upload program image', error);
      throw new Error('Failed to upload program image');
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      logger.debug('Deleting file', { url });
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
      logger.debug('File deleted successfully');
    } catch (error) {
      logger.error('Failed to delete file', error);
      throw new Error('Failed to delete file');
    }
  }
}
