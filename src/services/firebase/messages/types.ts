import { ChatMessage } from '../../../types/user';

export interface MessageData {
  userId: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: any; // FirebaseFirestore.Timestamp
}

export interface CreateMessageInput {
  userId: string;
  message: Omit<ChatMessage, 'id' | 'timestamp'>;
}

export interface UpdateMessageInput {
  messageId: string;
  content: string;
}