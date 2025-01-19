import { MessageRepository } from './repository';
import { ChatMessage } from '../../../types/user';
import { logger } from '../../logging';

export class MessageService {
  private repository: MessageRepository;

  constructor() {
    this.repository = new MessageRepository();
  }

  async createMessage(userId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
    try {
      return await this.repository.createMessage({ userId, message });
    } catch (error) {
      logger.error('Message service create failed', { userId, error });
      throw error;
    }
  }

  async updateMessage(messageId: string, content: string): Promise<void> {
    try {
      await this.repository.updateMessage({ messageId, content });
    } catch (error) {
      logger.error('Message service update failed', { messageId, error });
      throw error;
    }
  }

  subscribeToMessages(userId: string, onUpdate: (messages: ChatMessage[]) => void) {
    try {
      logger.debug('Setting up message subscription', { userId });
      return this.repository.subscribeToMessages(userId, onUpdate);
    } catch (error) {
      logger.error('Message service subscription failed', { userId, error });
      throw error;
    }
  }
}