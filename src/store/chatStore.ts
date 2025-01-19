import { create } from 'zustand';
import { ChatMessage } from '../types/user';
import { generateFitnessResponse } from '../services/openai';
import { messageService } from '../services';
import { UserProfileForAI } from '../services/openai/types';
import { toast } from 'react-hot-toast';
import { logger } from '../services/logging';
import { useUserStore } from './userStore';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  stopGeneration: (() => void) | null;
  error: string | null;
  unsubscribe: (() => void) | null;
  sendMessage: (content: string, userProfile: UserProfileForAI) => Promise<{ content: string } | undefined>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  clearMessages: () => void;
  clearError: () => void;
  abortedMessageId: string | null;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  stopGeneration: null,
  error: null,
  unsubscribe: null,
  abortedMessageId: null,

  clearError: () => set({ error: null }),

  sendMessage: async (content: string, userProfile: UserProfileForAI) => {
    const user = useUserStore.getState().user;
    if (!user?.id) {
      const error = 'Cannot send message: No user found';
      logger.error(error);
      set({ error });
      return;
    }

    try {
      // Create abort controller for stopping generation
      const abortController = new AbortController();
      set({ 
        isLoading: true, 
        error: null,
        stopGeneration: () => {
          abortController.abort();
          set({ stopGeneration: null });
        }
      });

      // Remove any previously aborted message
      const { abortedMessageId } = get();
      if (abortedMessageId) {
        set(state => ({
          messages: state.messages.filter(m => m.id !== abortedMessageId),
          abortedMessageId: null
        }));
      }

      // Create user message
      const userMessageId = await messageService.createMessage(user.id, {
        content,
        sender: 'user'
      });
      
      // Create initial AI message
      const aiMessageId = await messageService.createMessage(user.id, {
        content: '',
        sender: 'ai'
      });

      // Get current messages for context
      const currentMessages = get().messages;

      try {
        const response = await generateFitnessResponse(
          content,
          userProfile,
          currentMessages,
          aiMessageId,
          abortController.signal
        );

        if (response.error === 'Generation stopped by user') {
          await messageService.updateMessage(aiMessageId, 'Response aborted');
          set({ abortedMessageId: aiMessageId });
          return;
        }

        if (response.error) {
          throw new Error(response.error);
        }

        return response;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate response';
        logger.error('Failed to generate response:', error);
        set({ error: message });
        return undefined;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      logger.error('Failed to send message:', error);
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false, stopGeneration: null });
    }
  },

  subscribeToMessages: () => {
    const user = useUserStore.getState().user;
    if (!user?.id) {
      logger.error('Cannot subscribe to messages: No user found');
      return;
    }

    try {
      const unsubscribe = messageService.subscribeToMessages(
        user.id,
        (messages) => {
          set({ messages, error: null });
        }
      );
      set({ unsubscribe });
      logger.debug('Subscribed to messages', { userId: user.id });
    } catch (error) {
      logger.error('Failed to subscribe to messages', error);
      toast.error('Failed to load messages');
    }
  },

  unsubscribeFromMessages: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
      logger.debug('Unsubscribed from messages');
    }
  },

  clearMessages: () => {
    const { unsubscribeFromMessages } = get();
    unsubscribeFromMessages();
    set({ messages: [], error: null, abortedMessageId: null });
  }
}));