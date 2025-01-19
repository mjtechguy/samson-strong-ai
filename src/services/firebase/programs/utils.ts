import { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { Program } from '../../../types/program';
import { logger } from '../../logging';

export const convertTimestamp = (timestamp: Timestamp | undefined): Date => {
  return timestamp?.toDate() || new Date();
};

export const convertProgramDoc = (doc: QueryDocumentSnapshot<DocumentData>): Program => {
  try {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt)
    } as Program;
  } catch (error) {
    logger.error('Failed to convert program document', { docId: doc.id, error });
    throw new Error('Failed to convert program document');
  }
};