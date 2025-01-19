import { z } from 'zod';
import { settingsService } from '../services/settings/service';
import { logger } from '../services/logging';

const configSchema = z.object({
  apiKey: z.string().min(1, 'OpenAI API key is required'),
  model: z.string().min(1, 'OpenAI model is required'),
});

export const getOpenAIConfig = async () => {
  try {
    const [apiKey, model] = await Promise.all([
      settingsService.getSetting('openai_api_key'),
      settingsService.getSetting('openai_model')
    ]);

    if (!apiKey?.trim()) {
      throw new Error('OpenAI API key is not configured. Please configure it in the admin settings.');
    }

    if (!model?.trim()) {
      throw new Error('OpenAI model is not configured. Please configure it in the admin settings.');
    }

    const config = {
      apiKey: apiKey.trim(),
      model: model.trim(),
    };

    return configSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => issue.message).join(', ');
      throw new Error(`Invalid OpenAI configuration: ${issues}`);
    }
    
    logger.error('Failed to get OpenAI configuration:', error);
    throw error;
  }
};