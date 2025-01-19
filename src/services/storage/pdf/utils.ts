import { PDFMetadata } from './types';
import { pdfConfig } from './config';
import { logger } from '../../../services/logging';

export const generatePDFPath = (metadata: PDFMetadata): string => {
  try {
    const timestamp = Date.now();
    const sanitizedName = metadata.programName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `${pdfConfig.basePath}/${metadata.userId}/${sanitizedName}-${metadata.programId}-${timestamp}.pdf`;
  } catch (error) {
    logger.error('Failed to generate PDF path', { error, metadata });
    throw new Error('Failed to generate PDF path');
  }
};

export const validatePDFMetadata = (metadata: PDFMetadata): void => {
  try {
    const result = pdfConfig.validationSchema.safeParse(metadata);
    if (!result.success) {
      throw new Error(`Invalid PDF metadata: ${result.error.message}`);
    }
  } catch (error) {
    logger.error('PDF metadata validation failed', { error, metadata });
    throw error;
  }
};