import { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { ChatMessage } from '../../../types/user';
import { validateMessageData } from './validation';
import { logger } from '../../logging';

export const convertMessageData = (doc: QueryDocumentSnapshot<DocumentData>): ChatMessage | null => {
  const data = doc.data();
  const messageId = doc.id;

  if (!validateMessageData(data, messageId)) {
    return null;
  }

  try {
    // Handle timestamp conversion
    let timestamp: Date;
    if (data.timestamp instanceof Timestamp) {
      timestamp = data.timestamp.toDate();
    } else if (data.timestamp?.seconds) {
      timestamp = new Date(data.timestamp.seconds * 1000);
    } else {
      timestamp = new Date();
      logger.warn('Invalid timestamp, using current date', { messageId });
    }

    const message: ChatMessage = {
      id: messageId,
      content: data.content,
      sender: data.sender,
      timestamp
    };

    logger.debug('Message converted successfully', {
      messageId,
      timestamp: timestamp.toISOString()
    });

    return message;
  } catch (error) {
    logger.error('Failed to convert message', {
      messageId,
      error
    });
    return null;
  }
};