import OpenAI from 'openai';
import { getOpenAIConfig } from '../../config/openai';
import { UserProfileForAI, AIResponse, AIMessage } from './types';
import { createSystemPrompt } from './prompts';
import { logger } from '../logging';
import { ChatMessage } from '../../types/user';
import { settingsService } from '../settings/service';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const formatMessages = async (
  messages: ChatMessage[]
): Promise<AIMessage[]> => {
  if (!messages || !Array.isArray(messages)) {
    return [];
  }

  // Get max context length from settings
  const maxContextStr = await settingsService.getSetting('max_context_length');
  const maxContext = parseInt(maxContextStr) || 128000;

  // Take most recent messages up to max context
  const contextMessages = messages.slice(-maxContext);

  return contextMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
};

export async function generateFitnessResponse(
  message: string,
  userProfile: UserProfileForAI,
  previousMessages: ChatMessage[],
  signal?: AbortSignal
): Promise<AIResponse> {
  let lastError: Error | null = null;
  let fullResponse = '';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (signal?.aborted) {
        throw new Error('Generation stopped by user');
      }

      const config = await getOpenAIConfig();
      const openai = new OpenAI({
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true
      });
      
      // Get max response length from settings
      const maxTokensStr = await settingsService.getSetting('max_response_length');
      const maxTokens = parseInt(maxTokensStr) || 16000;

      // Validate OpenAI configuration
      if (!config.apiKey?.trim()) {
        throw new Error('OpenAI API key is not configured. Please configure it in the admin settings.');
      }

      if (!config.model?.trim()) {
        throw new Error('OpenAI model is not configured. Please configure it in the admin settings.');
      }

      // Format messages with context limit from settings
      const formattedMessages = await formatMessages(previousMessages || []);

      // Create system prompt with context awareness
      const messages: AIMessage[] = [
        { role: 'system', content: createSystemPrompt(userProfile) },
        ...formattedMessages,
        { role: 'user', content: message }
      ];

      const stream = await openai.chat.completions.create({
        model: config.model,
        messages,
        max_tokens: maxTokens,
        stream: true,
        temperature: 0.7
      });

      for await (const chunk of stream) {
        if (signal?.aborted) {
          throw new Error('Generation stopped by user');
        }

        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
        }
      }

      return { content: fullResponse };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message === 'Generation stopped by user') {
        return {
          content: 'Generation stopped by user',
          error: 'Generation stopped by user'
        };
      }

      if (error.response?.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your settings.');
      }
      
      lastError = error;
      if (attempt < MAX_RETRIES && !error.message?.includes('API key')) {
        logger.warn(`Attempt ${attempt} failed, retrying...`, error);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        continue;
      }
      
      const errorMessage = error.response?.status === 401
        ? 'Invalid OpenAI API key. Please check your settings.' 
        : (error.message || 'Failed to generate response. Please try again.');
      logger.error('Generation failed:', { error: errorMessage, details: error });
      break;
    }
  }

  const errorMessage = lastError?.message || 'Failed to generate response';
  return { content: '', error: errorMessage };
}