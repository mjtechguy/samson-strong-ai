import { MessageData } from './types';
import { logger } from '../../logging';

export const validateMessageData = (data: any, messageId: string): boolean => {
  if (!data) {
    logger.error('Empty message data', { messageId });
    return false;
  }

  const requiredFields: (keyof MessageData)[] = ['userId', 'content', 'sender', 'timestamp'];
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    logger.warn('Message missing required fields', {
      messageId,
      missingFields
    });
    return false;
  }

  if (!['user', 'ai'].includes(data.sender)) {
    logger.warn('Invalid message sender', {
      messageId,
      sender: data.sender
    });
    return false;
  }

  return true;
};