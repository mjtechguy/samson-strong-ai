import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { logger } from '../services/logging';
import { CopyButton } from './chat/CopyButton';
import { settingsService } from '../services/settings/service';
import { Link } from 'react-router-dom';
import { StopIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

export const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [disclaimer, setDisclaimer] = useState('');
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    messages, 
    isLoading, 
    stopGeneration,
    error, 
    sendMessage,
    clearError
  } = useChatStore();
  const user = useUserStore(state => state.user);
  const isAdmin = user?.isAdmin;

  // Load disclaimer on mount
  useEffect(() => {
    loadDisclaimer();
  }, []);

  const loadDisclaimer = async () => {
    try {
      const text = await settingsService.getSetting('ai_disclaimer');
      setDisclaimer(text);
    } catch (error) {
      // Don't show error for disclaimer - not critical
      logger.warn('Failed to load AI disclaimer', error);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Reset streaming content when messages change
  useEffect(() => {
    setStreamingContent(null);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const message = input;
    setInput('');
    setStreamingContent('');
    clearError();
    
    try {
      const response = await sendMessage(message, {
        name: user.name,
        age: user.age,
        weight: user.weight,
        height: user.height,
        sex: user.sex,
        fitnessGoals: user.fitnessGoals,
        experienceLevel: user.experienceLevel,
        unitSystem: user.unitSystem,
        medicalConditions: user.medicalConditions
      });
      if (response?.content) {
        setStreamingContent(response.content);
      }
    } catch (error) {
      logger.error('Message handling failed', error);
    }
  };

  const handleStop = () => {
    if (stopGeneration) {
      stopGeneration();
      toast.success('Response generation stopped');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please complete your profile first</p>
          <Link
            to="/profile"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{error}</p>
                    {error.includes('OpenAI') && isAdmin && (
                      <p className="mt-2 text-sm text-red-700">
                        Please configure the OpenAI settings in the{' '}
                        <Link to="/admin/settings" className="font-medium underline">
                          admin settings
                        </Link>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={clearError}
                    className="ml-4 text-red-700 hover:text-red-900"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-4 ${
                    message.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white shadow-sm border border-gray-200'
                  }`}
                >
                  <ReactMarkdown 
                    className={`prose prose-sm max-w-none ${
                      message.sender === 'user' 
                        ? 'prose-invert' 
                        : 'prose-gray prose-headings:text-gray-900 prose-headings:mt-0 prose-headings:mb-2 prose-p:text-gray-900 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0'
                    }`}
                  >
                    {message.id === messages[messages.length - 1]?.id && streamingContent !== null
                      ? streamingContent
                      : message.content.trim()}
                  </ReactMarkdown>
                  {message.sender === 'ai' && (
                    <div className="mt-2 pt-2 border-t border-gray-200 flex justify-end">
                      <CopyButton content={message.content} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>
      </div>
      <div className="bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
              placeholder={isLoading ? 'Please wait...' : 'Ask about your fitness program...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 resize-none overflow-hidden min-h-[38px] py-2 pr-12"
            />
            {isLoading && stopGeneration ? (
              <button
                type="button"
                onClick={handleStop}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                aria-label="Stop generation"
              >
                <StopIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                aria-label="Send message"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            )}
          </form>
          {disclaimer && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 text-center">{disclaimer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};