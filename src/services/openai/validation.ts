import OpenAI from 'openai';
import { logger } from '../logging';

export interface OpenAIModel {
  id: string;
  name?: string;
  description?: string;
}

export async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    // Try to list models as a validation check
    await openai.models.list();
    return true;
  } catch (error) {
    logger.error('OpenAI key validation failed:', error);
    return false;
  }
}

export async function getAvailableModels(apiKey: string): Promise<OpenAIModel[]> {
  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    const response = await openai.models.list();
    
    // Filter for chat models and sort by ID
    const chatModels = response.data
      .filter(model => model.id.includes('gpt'))
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(model => ({
        id: model.id,
        name: model.id.replace('gpt-', 'GPT ').toUpperCase(),
        description: `${model.id}`
      }));

    return chatModels;
  } catch (error) {
    logger.error('Failed to fetch OpenAI models:', error);
    throw new Error('Failed to fetch available models');
  }
}