import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { logger } from '../../logging';

const MESSAGES_PER_PAGE = 50;

export const createMessagesQuery = (userId: string) => {
  logger.debug('Creating messages query', { userId });
  
  const messagesRef = collection(db, 'messages');
  
  return query(
    messagesRef,
    where('userId', '==', userId),
    orderBy('timestamp', 'asc'),
    limit(MESSAGES_PER_PAGE)
  );
};