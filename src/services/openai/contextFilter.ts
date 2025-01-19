import { ChatMessage } from '../../types/user';
import { calculateRelevanceScore } from './relevance';
import { logger } from '../logging';
import { analyzeIntent } from './intent';

const SIMILARITY_THRESHOLD = 0.2;
const CONVERSATION_BREAK_MS = 30 * 60 * 1000; // 30 minutes
const RECENT_MESSAGE_BOOST = 1.5;
const VERY_RECENT_MESSAGE_BOOST = 2.0;
const VERY_RECENT_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export const filterRelevantContext = (
  messages: ChatMessage[],
  currentMessage: string,
  maxContextMessages: number
): ChatMessage[] => {
  if (messages.length === 0) return [];

  // Always include the most recent messages
  const recentMessages = messages.slice(-3);

  logger.debug('Filtering context', { 
    totalMessages: messages.length,
    maxContextMessages
  });
  
  // Get user's last message for intent analysis
  const lastUserMessage = messages
    .slice()
    .reverse()
    .find(m => m.sender === 'user');
    
  // Get last AI response for context
  const lastAIResponse = messages
    .slice()
    .reverse()
    .find(m => m.sender === 'ai');

  // Analyze intent to see if user is referring to previous response
  const intent = analyzeIntent(currentMessage, lastUserMessage?.content, lastAIResponse?.content);

  // Score each message for relevance
  const scoredMessages = messages.map(message => ({
    message,
    score: calculateRelevanceScore(message.content, currentMessage, intent),
    isRecent: recentMessages.includes(message)
  }));

  // Find conversation breaks (gaps > 30 minutes)
  const conversationBreaks = findConversationBreaks(messages);

  // Get the current conversation messages
  const currentConversation = getCurrentConversation(messages, conversationBreaks);

  // Combine relevance and recency
  const rankedMessages = scoredMessages
    .map(({ message, score, isRecent }) => ({
      message,
      score: calculateFinalScore(
        score,
        message,
        currentConversation,
        messages[messages.length - 1].timestamp,
        isRecent
      )
    }))
    .filter(({ score }) => score > SIMILARITY_THRESHOLD);

  // Sort by final score
  const sortedMessages = rankedMessages
    .sort((a, b) => b.score - a.score)
    .slice(0, maxContextMessages);

  logger.debug('Context filtered', {
    relevantMessages: sortedMessages.length,
    averageScore: sortedMessages.reduce((acc, { score }) => acc + score, 0) / sortedMessages.length
  });

  // Return messages in chronological order
  return sortedMessages
    .sort((a, b) => a.message.timestamp.getTime() - b.message.timestamp.getTime())
    .map(({ message }) => message);
};

const findConversationBreaks = (messages: ChatMessage[]): number[] => {
  const breaks: number[] = [];
  
  for (let i = 1; i < messages.length; i++) {
    const timeDiff = messages[i].timestamp.getTime() - messages[i - 1].timestamp.getTime();
    if (timeDiff > CONVERSATION_BREAK_MS) {
      breaks.push(i);
    }
  }
  
  return breaks;
};

const getCurrentConversation = (messages: ChatMessage[], breaks: number[]): ChatMessage[] => {
  const lastBreak = breaks[breaks.length - 1] || 0;
  return messages.slice(lastBreak);
};

const calculateFinalScore = (
  relevanceScore: number,
  message: ChatMessage,
  currentConversation: ChatMessage[],
  lastMessageTime: Date,
  isRecent: boolean
): number => {
  // Base score is the relevance score
  let finalScore = relevanceScore;

  // Apply recency boost
  if (isRecent) {
    const timeSinceMessage = lastMessageTime.getTime() - message.timestamp.getTime();
    if (timeSinceMessage < VERY_RECENT_THRESHOLD) {
      finalScore *= VERY_RECENT_MESSAGE_BOOST;
    } else {
      finalScore *= RECENT_MESSAGE_BOOST;
    }
  }

  // Boost score if message is part of the current conversation
  if (currentConversation.some(m => m.id === message.id)) {
    finalScore *= 1.2;
  }

  // Apply time decay
  const hoursSinceMessage = (lastMessageTime.getTime() - message.timestamp.getTime()) / (1000 * 60 * 60);
  const timeDecay = Math.exp(-hoursSinceMessage / 12); // 12-hour half-life for faster decay
  finalScore *= timeDecay;

  return finalScore;
};