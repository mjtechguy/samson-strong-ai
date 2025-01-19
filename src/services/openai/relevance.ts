import { calculateSimilarity } from './similarity';
import { removeStopwords } from './stopwords';
import { Intent } from './intent';

export const calculateRelevanceScore = (
  messageA: string, 
  messageB: string,
  intent?: Intent
): number => {
  // Convert to lowercase and remove punctuation
  const cleanA = messageA.toLowerCase().replace(/[^\w\s]/g, '');
  const cleanB = messageB.toLowerCase().replace(/[^\w\s]/g, '');

  // Remove stopwords and join back to strings
  const processedA = removeStopwords(cleanA.split(/\s+/)).join(' ');
  const processedB = removeStopwords(cleanB.split(/\s+/)).join(' ');

  // Calculate similarity using Jaccard similarity
  const similarity = calculateSimilarity(processedA, processedB);

  // Boost score if intent indicates reference to previous context
  let score = similarity;
  if (intent?.referencesPrevious) {
    score *= 1.5;
  }
  
  // Apply sigmoid function to smooth out the similarity score
  const smoothedScore = 1 / (1 + Math.exp(-10 * (score - 0.5)));

  return smoothedScore;
};