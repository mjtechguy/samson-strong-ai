import { logger } from '../logging';

export interface Intent {
  referencesPrevious: boolean;
  requestType?: 'another' | 'modify' | 'clarify';
}

const REFERENCE_PHRASES = [
  'another',
  'one more',
  'different',
  'similar',
  'like that',
  'same',
  'again',
  'more',
  'another one'
];

const ANOTHER_PHRASES = [
  'another',
  'one more',
  'another one',
  'different one',
  'new one'
];

export function analyzeIntent(
  currentMessage: string,
  lastUserMessage?: string,
  lastAIResponse?: string
): Intent {
  try {
    const message = currentMessage.toLowerCase();
    
    // Check if message is very short and contains reference phrases
    const words = message.split(/\s+/);
    const isShortMessage = words.length <= 4;
    const hasReferencePhrase = REFERENCE_PHRASES.some(phrase => {
      const phraseWords = phrase.split(' ');
      return phraseWords.every(word => message.includes(word));
    });

    // Specifically check for phrases requesting "another"
    const requestsAnother = ANOTHER_PHRASES.some(phrase => {
      const phraseWords = phrase.split(' ');
      return phraseWords.every(word => message.includes(word));
    });

    // Short messages with reference phrases are likely requesting variations
    const isRequestingVariation = isShortMessage && (hasReferencePhrase || requestsAnother);

    const intent: Intent = {
      referencesPrevious: hasReferencePhrase || isRequestingVariation,
      requestType: (requestsAnother || isRequestingVariation) ? 'another' : undefined
    };

    logger.debug('Analyzed message intent', { 
      message: currentMessage,
      intent,
      analysis: {
        isShortMessage,
        hasReferencePhrase,
        requestsAnother,
        isRequestingVariation
      }
    });

    return intent;
  } catch (error) {
    logger.error('Failed to analyze message intent', error);
    return { referencesPrevious: false };
  }
}