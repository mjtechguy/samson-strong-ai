import { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { Program } from '../../../types/program';
import { logger } from '../../logging';

export const convertProgramData = (doc: QueryDocumentSnapshot<DocumentData>): Program | null => {
  try {
    const data = doc.data();
    
    if (!data) {
      logger.warn('Empty program data', { programId: doc.id });
      return null;
    }

    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date();
      
    const updatedAt = data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate() 
      : new Date();

    const program: Program = {
      id: doc.id,
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      template: data.template,
      createdAt,
      updatedAt
    };

    logger.debug('Program data converted', { programId: doc.id });
    return program;
  } catch (error) {
    logger.error('Failed to convert program data', { programId: doc.id, error });
    return null;
  }
}