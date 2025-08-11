"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { Badge } from "@/components/ui/badge";
import { PaperPlaneIcon, ShootingStarIcon, ChatIcon, ArrowUpIcon } from "@/icons";
interface InsightResponse {
  success: boolean;
  query: string;
  insights: string;
  context_count: number;
  debug?: {
    vectorized_chunks: number;
    search_time_ms: number;
    top_matches?: unknown[];
  };
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

const InsightsPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQueries = [
    {
      text: "How have our communication patterns changed over time?",
      icon: <ChatIcon className="w-4 h-4" />,
      category: "Communication"
    },
    {
      text: "What are the signs of conflict in our relationship?",
      icon: <ArrowUpIcon className="w-4 h-4" />,
      category: "Conflict"
    },
    {
      text: "How do we express affection and intimacy?",
      icon: <ShootingStarIcon className="w-4 h-4" />,
      category: "Intimacy"
    }
  ];

  const handleSubmit = async (query: string) => {
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    const loadingMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      type: 'assistant',
      content: "Analyzing your relationship data...",
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          top_k: 10,
          filters: {}
        }),
      });

      const data: InsightResponse = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: data.insights,
          timestamp: new Date()
        };

        setMessages(prev => prev.slice(0, -1).concat([assistantMessage]));
      } else {
        throw new Error('Failed to generate insights');
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: "I'm sorry, I encountered an error generating insights. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => prev.slice(0, -1).concat([errorMessage]));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(inputValue);
  };

  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h3 key={index} className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={index} className="font-medium text-gray-800 dark:text-gray-200 mt-3 mb-1">{line.replace(/\*\*/g, '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 text-gray-700 dark:text-gray-300 mb-1">{line.replace('- ', '')}</li>;
      }
      if (line.match(/^\d+\./)) {
        return <li key={index} className="ml-4 text-gray-700 dark:text-gray-300 mb-1">{line}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="text-gray-700 dark:text-gray-300 mb-2">{line}</p>;
    });
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Relationship Insights" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <div className="h-[700px] flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="border-b border-gray-100 dark:border-gray-800 p-6">
              <h3 className="flex items-center gap-2 text-base font-medium text-gray-800 dark:text-white/90">
                <ShootingStarIcon className="w-5 h-5 text-blue-500" />
                AI Relationship Analyst
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ask questions about your relationship patterns and get insights based on your message history.
              </p>
            </div>
            
            <div className="flex-1 flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <ShootingStarIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Start Your Relationship Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Ask questions about your communication patterns, conflicts, intimacy, or any relationship topic.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {message.loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            <span>{message.content}</span>
                          </div>
                        ) : message.type === 'assistant' ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            {formatMessageContent(message.content)}
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Input Area */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-4">
                <form onSubmit={handleInputSubmit} className="flex gap-2">
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about your relationship patterns..."
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading || !inputValue.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    <PaperPlaneIcon className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions Panel */}
        <div className="space-y-6">
          <ComponentCard title="Suggested Questions">
            <div className="space-y-3">
              {suggestedQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSubmit(query.text)}
                  disabled={isLoading}
                  className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-blue-500 mt-0.5">
                      {query.icon}
                    </div>
                    <div>
                      <div className="mb-2">
                        <Badge variant="light" color="light" size="sm">
                          {query.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {query.text}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ComponentCard>

          <ComponentCard title="Analysis Stats">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Vectorized Chunks</span>
                <span className="font-medium">194</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Messages</span>
                <span className="font-medium">30,250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Analysis Period</span>
                <span className="font-medium">2.5 years</span>
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;