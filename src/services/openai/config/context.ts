import { ContextConfig } from '../types/context';

export const contextConfig: ContextConfig = {
  maxMessages: 10,
  similarityThreshold: 0.3,
  conversationBreakMs: 30 * 60 * 1000, // 30 minutes
  timeDecayHours: 24 // 24-hour half-life
};