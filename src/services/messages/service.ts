import { supabase } from '../../config/supabase';
import { ChatMessage } from '../../types/user';
import { logger } from '../logging';
import { RealtimeChannel } from '@supabase/supabase-js';

export class MessageService {
  private subscriptions: Map<string, RealtimeChannel> = new Map();
  private updateCallbacks = new Map<string, (messages: ChatMessage[]) => void>();
  private messageCache = new Map<string, ChatMessage[]>();

  async createMessage(userId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
    try {
      // Validate user ID
      if (!userId) {
        throw new Error('User ID is required');
      }

      const messageData = {
        user_id: userId,
        content: message.content || '',
        sender: message.sender,
        timestamp: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create message:', error);
        throw new Error('Failed to create message');
      }

      if (!data) {
        throw new Error('No data returned from message creation');
      }

      // Update cache
      const newMessage: ChatMessage = {
        id: data.id,
        content: data.content,
        sender: data.sender,
        timestamp: new Date(data.timestamp)
      };

      const cachedMessages = this.messageCache.get(userId) || [];
      cachedMessages.push(newMessage);
      this.messageCache.set(userId, cachedMessages);

      // Notify subscribers
      const callback = this.updateCallbacks.get(userId);
      if (callback) {
        callback([...cachedMessages]);
      }

      return data.id;
    } catch (error) {
      logger.error('Failed to create message:', error);
      throw error;
    }
  }

  async updateMessage(messageId: string | null, content: string): Promise<void> {
    if (!messageId) {
      logger.warn('No message ID provided for update');
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content,
          timestamp: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        logger.error('Failed to update message:', error);
        throw new Error('Failed to update message');
      }
    } catch (error) {
      logger.error('Failed to update message:', error);
      throw error;
    }
  }

  subscribeToMessages(userId: string, onUpdate: (messages: ChatMessage[]) => void) {
    try {
      this.unsubscribeFromMessages(userId);
      this.updateCallbacks.set(userId, onUpdate);

      // Use cache if available, otherwise fetch
      const cachedMessages = this.messageCache.get(userId);
      if (cachedMessages) {
        onUpdate([...cachedMessages]);
      }

      // Fetch fresh messages
      this.fetchMessages(userId)
        .then(messages => {
          this.messageCache.set(userId, messages);
          onUpdate([...messages]);
        })
        .catch(error => {
          logger.error('Failed to fetch messages', error);
        });

      // Real-time subscription for background sync
      const channel = supabase
        .channel(`messages:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `user_id=eq.${userId}`
          },
          async () => {
            const messages = await this.fetchMessages(userId);
            this.messageCache.set(userId, messages);
            const callback = this.updateCallbacks.get(userId);
            if (callback) {
              callback([...messages]);
            }
          }
        )
        .subscribe();

      this.subscriptions.set(userId, channel);
      return () => this.unsubscribeFromMessages(userId);
    } catch (error) {
      logger.error('Message subscription failed', error);
      throw error;
    }
  }

  unsubscribeFromMessages(userId: string) {
    const channel = this.subscriptions.get(userId);
    if (channel) {
      channel.unsubscribe();
      this.subscriptions.delete(userId);
      this.updateCallbacks.delete(userId);
      this.messageCache.delete(userId);
    }
  }

  private async fetchMessages(userId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select()
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      logger.error('Failed to fetch messages', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const messageService = new MessageService();