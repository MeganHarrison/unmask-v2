'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Brain, Heart, TrendingUp, MessageSquare } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { AgentIndicator } from './AgentIndicator';
import { QuickActions } from './QuickActions';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentType?: string;
  confidence?: number;
  metadata?: {
    nextSteps?: string[];
    relatedInsights?: string[];
    coachingStyle?: string;
    interventionType?: string;
    searchResults?: number;
    model?: string;
  };
}

interface ChatInterfaceProps {
  initialMessages?: ChatMessage[];
  onMessageSend?: (message: string) => void;
  className?: string;
  useAutoRAG?: boolean;
}

export function ChatInterface({ 
  initialMessages = [], 
  onMessageSend,
  className = '',
  useAutoRAG = false
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Optional external handler
    if (onMessageSend) {
      onMessageSend(userMessage.content);
    }

    try {
      // Call the chat API - use AutoRAG or regular RAG based on prop
      const apiEndpoint = useAutoRAG ? '/api/chat/autorag' : '/api/chat/rag';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
        agentType: data.agentType,
        confidence: data.confidence,
        metadata: {
          nextSteps: data.nextSteps,
          relatedInsights: data.relatedInsights,
          coachingStyle: data.coachingStyle,
          interventionType: data.interventionType,
          searchResults: data.searchResults,
          model: data.model,
        },
      };

      setCurrentAgent(data.agentType);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble processing your request right now. Could you try rephrasing your question?",
        timestamp: new Date().toISOString(),
        agentType: 'error',
        confidence: 0.1,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCurrentAgent(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    inputRef.current?.focus();
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relationship Coach</h1>
            <p className="text-sm text-gray-600 mt-1">
              Your AI-powered relationship intelligence system
            </p>
          </div>
          {currentAgent && (
            <AgentIndicator agentType={currentAgent} />
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome to Your Relationship Intelligence System
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              I'm here to help you understand your relationship patterns, resolve conflicts, 
              and build deeper connection. What would you like to explore today?
            </p>
            <QuickActions onActionSelect={handleQuickAction} />
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <TypingIndicator agentType={currentAgent} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind about your relationship..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={inputValue.split('\n').length || 1}
              maxLength={2000}
              disabled={isLoading}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {inputValue.length}/2000
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {messages.length > 0 && (
          <QuickActions onActionSelect={handleQuickAction} variant="compact" />
        )}
      </div>
    </div>
  );
}