"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

// Mix of TailAdmin and shadcn components
import ComponentCard from "@/components/common/ComponentCard"; // Keep existing
import { Button } from "@/components/ui/button"; // Use shadcn
import { Input } from "@/components/ui/input"; // Use shadcn  
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Use shadcn
import { Badge } from "@/components/ui/badge"; // Use shadcn

// Icons from both systems
import { ShootingStarIcon } from "@/icons";
import { Send, Sparkles, MessageSquare, TrendingUp, Heart } from "lucide-react";

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

const InsightsV2Page = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQueries = [
    {
      text: "How have our communication patterns changed over time?",
      icon: <MessageSquare className="w-4 h-4" />,
      category: "Communication"
    },
    {
      text: "What are the signs of conflict in our relationship?",
      icon: <TrendingUp className="w-4 h-4" />,
      category: "Conflict"
    },
    {
      text: "How do we express affection and intimacy?",
      icon: <Heart className="w-4 h-4" />,
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
      <PageBreadcrumb pageTitle="Insights v2 (shadcn Demo)" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface - Using shadcn Card */}
        <div className="lg:col-span-2">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                AI Relationship Analyst (v2)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Now powered by shadcn/ui components for better accessibility and interactions.
              </p>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
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
              
              {/* Input Area - Using shadcn components */}
              <div className="border-t p-4">
                <form onSubmit={handleInputSubmit} className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about your relationship patterns..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions Panel - Mix of TailAdmin and shadcn */}
        <div className="space-y-6">
          {/* TailAdmin ComponentCard with shadcn content */}
          <ComponentCard title="Suggested Questions">
            <div className="space-y-3">
              {suggestedQueries.map((query, index) => (
                <Button
                  key={index}
                  onClick={() => handleSubmit(query.text)}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full p-3 h-auto justify-start text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-blue-500 mt-0.5">
                      {query.icon}
                    </div>
                    <div className="text-left">
                      <Badge variant="secondary" className="mb-2">
                        {query.category}
                      </Badge>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {query.text}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ComponentCard>

          {/* shadcn Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Analysis Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Vectorized Chunks</span>
                  <Badge variant="outline">194</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Messages</span>
                  <Badge variant="outline">30,250</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Analysis Period</span>
                  <Badge variant="outline">2.5 years</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits of v2 */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <ShootingStarIcon className="w-4 h-4" />
                v2 Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
                <li>✨ Better accessibility with Radix primitives</li>
                <li>🎨 More consistent styling with CVA variants</li>
                <li>⌨️ Improved keyboard navigation</li>
                <li>🎯 Better focus management</li>
                <li>📱 Enhanced mobile experience</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InsightsV2Page;