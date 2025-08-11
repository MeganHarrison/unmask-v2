// lib/hooks/useMemoryAgent.ts - React hook for memory agent interactions
import { useState, useCallback } from 'react';

interface MemoryRequest {
  queryType: 'search' | 'timeline' | 'patterns' | 'context' | 'insights';
  query?: string;
  timeframe?: {
    start?: string;
    end?: string;
  };
  filters?: {
    sentiment?: 'positive' | 'negative' | 'neutral';
    sender?: 'user' | 'partner';
  };
  limit?: number;
}

interface MemoryResult {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'partner';
  sentimentScore: number;
  relevanceScore?: number;
}

interface MemoryResponse {
  results: MemoryResult[];
  totalCount: number;
  insights?: string[];
  timeline?: any[];
  patterns?: any[];
  confidence: number;
  searchSummary?: string;
}

export function useMemoryAgent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryMemory = useCallback(async (request: MemoryRequest): Promise<MemoryResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/memory/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Memory query failed: ${response.statusText}`);
      }

      const data: MemoryResponse = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Memory query failed';
      setError(errorMessage);
      console.error('Memory agent error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchMessages = useCallback((query: string, filters?: MemoryRequest['filters']) => {
    return queryMemory({
      queryType: 'search',
      query,
      filters,
      limit: 20
    });
  }, [queryMemory]);

  const getTimeline = useCallback((timeframe?: MemoryRequest['timeframe']) => {
    return queryMemory({
      queryType: 'timeline',
      timeframe
    });
  }, [queryMemory]);

  const analyzePatterns = useCallback((timeframe?: MemoryRequest['timeframe']) => {
    return queryMemory({
      queryType: 'patterns',
      timeframe
    });
  }, [queryMemory]);

  const getInsights = useCallback(() => {
    return queryMemory({
      queryType: 'insights'
    });
  }, [queryMemory]);

  return {
    queryMemory,
    searchMessages,
    getTimeline,
    analyzePatterns,
    getInsights,
    isLoading,
    error
  };
}