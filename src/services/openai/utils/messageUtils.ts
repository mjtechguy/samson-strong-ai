import { ChatMessage } from '../../../types/user';
import { ContextMessage } from '../types/context';

export const formatMessageForContext = (message: ChatMessage): ContextMessage => ({
  content: message.content,
  timestamp: message.timestamp
});

export const cleanText = (text: string): string => 
  text.toLowerCase().replace(/[^\w\s]/g, '');