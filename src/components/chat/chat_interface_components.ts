// components/chat/ChatInterface.tsx
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
  };
}

interface ChatInterfaceProps {
  initialMessages?: ChatMessage[];
  onMessageSend?: (message: string) => void;
  className?: string;
}

export function ChatInterface({ 
  initialMessages = [], 
  onMessageSend,
  className = '' 
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
      // Call the chat API
      const response = await fetch('/api/chat', {
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

// components/chat/MessageBubble.tsx
import React from 'react';
import { User, Bot, CheckCircle, AlertCircle } from 'lucide-react';
import { ChatMessage } from './ChatInterface';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const agentIcon = getAgentIcon(message.agentType);
  const confidenceColor = getConfidenceColor(message.confidence);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600 ml-2' : 'bg-gray-100 mr-2'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            agentIcon
          )}
        </div>

        {/* Message Content */}
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Agent Metadata */}
          {!isUser && message.metadata && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {/* Next Steps */}
              {message.metadata.nextSteps && message.metadata.nextSteps.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Next Steps
                  </h4>
                  <ul className="space-y-1">
                    {message.metadata.nextSteps.map((step, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Insights */}
              {message.metadata.relatedInsights && message.metadata.relatedInsights.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Related Insights
                  </h4>
                  <ul className="space-y-1">
                    {message.metadata.relatedInsights.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Timestamp and Confidence */}
          <div className={`flex items-center justify-between mt-2 text-xs ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {!isUser && message.confidence && (
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${confidenceColor}`} />
                <span>{Math.round(message.confidence * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getAgentIcon(agentType?: string) {
  const iconClass = "w-4 h-4 text-gray-600";
  
  switch (agentType) {
    case 'coaching-agent':
      return <Heart className={iconClass} />;
    case 'pattern-agent':
      return <TrendingUp className={iconClass} />;
    case 'conflict-agent':
      return <AlertCircle className={iconClass} />;
    case 'emotional-agent':
      return <Heart className={iconClass} />;
    case 'memory-agent':
      return <Brain className={iconClass} />;
    default:
      return <Bot className={iconClass} />;
  }
}

function getConfidenceColor(confidence?: number): string {
  if (!confidence) return 'bg-gray-400';
  if (confidence >= 0.8) return 'bg-green-500';
  if (confidence >= 0.6) return 'bg-yellow-500';
  return 'bg-red-500';
}

// components/chat/TypingIndicator.tsx
import React from 'react';
import { Brain, Heart, TrendingUp, MessageSquare } from 'lucide-react';

interface TypingIndicatorProps {
  agentType?: string | null;
}

export function TypingIndicator({ agentType }: TypingIndicatorProps) {
  const agentName = getAgentName(agentType);
  const agentIcon = getAgentIcon(agentType);

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          {agentIcon}
        </div>
        <div className="bg-gray-100 rounded-2xl px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{agentName} is thinking</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAgentName(agentType?: string | null): string {
  switch (agentType) {
    case 'coaching-agent':
      return 'Relationship Coach';
    case 'pattern-agent':
      return 'Pattern Analyst';
    case 'conflict-agent':
      return 'Conflict Specialist';
    case 'emotional-agent':
      return 'Emotional Intelligence';
    case 'memory-agent':
      return 'Memory Specialist';
    default:
      return 'AI Coach';
  }
}

function getAgentIcon(agentType?: string | null) {
  const iconClass = "w-4 h-4 text-gray-600";
  
  switch (agentType) {
    case 'coaching-agent':
      return <Heart className={iconClass} />;
    case 'pattern-agent':
      return <TrendingUp className={iconClass} />;
    case 'conflict-agent':
      return <MessageSquare className={iconClass} />;
    case 'emotional-agent':
      return <Heart className={iconClass} />;
    case 'memory-agent':
      return <Brain className={iconClass} />;
    default:
      return <Brain className={iconClass} />;
  }
}

// components/chat/AgentIndicator.tsx
import React from 'react';
import { Brain, Heart, TrendingUp, MessageSquare, Shield } from 'lucide-react';

interface AgentIndicatorProps {
  agentType: string;
  className?: string;
}

export function AgentIndicator({ agentType, className = '' }: AgentIndicatorProps) {
  const agent = getAgentInfo(agentType);

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg ${className}`}>
      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
        {agent.icon}
      </div>
      <div>
        <div className="text-sm font-medium text-blue-900">{agent.name}</div>
        <div className="text-xs text-blue-600">{agent.description}</div>
      </div>
    </div>
  );
}

function getAgentInfo(agentType: string) {
  const iconClass = "w-3 h-3 text-blue-600";
  
  switch (agentType) {
    case 'coaching-agent':
      return {
        name: 'Relationship Coach',
        description: 'Strategic guidance & advice',
        icon: <Heart className={iconClass} />
      };
    case 'pattern-agent':
      return {
        name: 'Pattern Analyst',
        description: 'Trend & behavior analysis',
        icon: <TrendingUp className={iconClass} />
      };
    case 'conflict-agent':
      return {
        name: 'Conflict Specialist',
        description: 'Resolution strategies',
        icon: <Shield className={iconClass} />
      };
    case 'emotional-agent':
      return {
        name: 'Emotional Intelligence',
        description: 'Sentiment & attachment insights',
        icon: <Heart className={iconClass} />
      };
    case 'memory-agent':
      return {
        name: 'Memory Specialist',
        description: 'Historical context & data',
        icon: <Brain className={iconClass} />
      };
    default:
      return {
        name: 'AI Coach',
        description: 'Relationship intelligence',
        icon: <Brain className={iconClass} />
      };
  }
}

// components/chat/QuickActions.tsx
import React from 'react';
import { MessageSquare, TrendingUp, Heart, Brain, Clock } from 'lucide-react';

interface QuickActionsProps {
  onActionSelect: (action: string) => void;
  variant?: 'default' | 'compact';
}

export function QuickActions({ onActionSelect, variant = 'default' }: QuickActionsProps) {
  const quickActions = [
    {
      icon: <MessageSquare className="w-4 h-4" />,
      label: 'Help with Response',
      action: "Help me respond to a message from my partner",
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Analyze Patterns',
      action: "How has our communication changed over the past few months?",
      color: 'bg-green-50 text-green-700 hover:bg-green-100'
    },
    {
      icon: <Heart className="w-4 h-4" />,
      label: 'Relationship Health',
      action: "How is our relationship doing overall?",
      color: 'bg-pink-50 text-pink-700 hover:bg-pink-100'
    },
    {
      icon: <Brain className="w-4 h-4" />,
      label: 'Understand Conflict',
      action: "Why do we keep having the same arguments?",
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Recent Insights',
      action: "Show me insights from our conversations this week",
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {quickActions.slice(0, 3).map((action, index) => (
          <button
            key={index}
            onClick={() => onActionSelect(action.action)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${action.color}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {quickActions.map((action, index) => (
        <button
          key={index}
          onClick={() => onActionSelect(action.action)}
          className={`p-4 rounded-xl border border-gray-200 text-left transition-all hover:shadow-md ${action.color}`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {action.icon}
            </div>
            <div>
              <div className="font-medium text-sm">{action.label}</div>
              <div className="text-xs opacity-75 mt-1">
                {action.action.length > 40 
                  ? action.action.substring(0, 40) + '...' 
                  : action.action
                }
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}