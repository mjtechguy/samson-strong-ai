export interface ContextMessage {
  content: string;
  timestamp: Date;
  relevanceScore?: number;
}

export interface ContextConfig {
  maxMessages: number;
  similarityThreshold: number;
  conversationBreakMs: number;
  timeDecayHours: number;
}