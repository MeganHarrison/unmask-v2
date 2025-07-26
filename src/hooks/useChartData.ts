"use client"

import { useState, useEffect } from 'react';

interface ApiResponse<T> {
  success: boolean;
  data?: T[];
  error?: string;
  metadata?: {
    totalEntries?: number;
    monthsTracked?: number;
    dateRange?: {
      start: string | null;
      end: string | null;
    };
  };
}

interface UseChartDataOptions {
  refetchInterval?: number;
  enabled?: boolean;
}

export function useChartData<T>(
  endpoint: string, 
  options: UseChartDataOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [metadata, setMetadata] = useState<any>(null);

  const { refetchInterval, enabled = true } = options;

  const fetchData = async () => {
    if (!enabled) return;
    
    setLoading(true);
    try {
      const response = await fetch(endpoint);
      const result: ApiResponse<T> = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
        setMetadata(result.metadata || null);
        setError(undefined);
      } else {
        setError(result.error || 'Failed to fetch data');
        setData([]);
      }
    } catch (err) {
      console.error(`Error fetching data from ${endpoint}:`, err);
      setError('Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, enabled]);

  // Optional auto-refresh
  useEffect(() => {
    if (!refetchInterval || !enabled) return;
    
    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [refetchInterval, enabled, endpoint]);

  return { 
    data, 
    loading, 
    error, 
    metadata,
    refetch: fetchData 
  };
}