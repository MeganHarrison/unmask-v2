import { useState, useEffect } from 'react';
import { useChartData } from './useChartData';
import { relationshipConfig } from '../config/chartConfigs';
import { RelationshipDataPoint } from '@/types/chart';

interface TextMessage {
  id: number;
  date_time: string;
  sender: string;
  message: string;
  sentiment: string;
  category: string;
  tag: string;
  conflict_detected: boolean;
}

interface TextsApiResponse {
  success: boolean;
  data?: TextMessage[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useUnmaskPageData() {
  // Chart data using the reusable hook
  const { data: chartData, loading: chartLoading, error: chartError } = 
    useChartData<RelationshipDataPoint>(relationshipConfig.apiEndpoint);

  // Text messages data
  const [textsData, setTextsData] = useState<TextMessage[]>([]);
  const [textsLoading, setTextsLoading] = useState(true);
  const [textsPagination, setTextsPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  const fetchTextsData = async (page: number = 1, limit: number = 50) => {
    setTextsLoading(true);
    try {
      const response = await fetch(`/api/texts-bc?page=${page}&limit=${limit}`);
      const result: TextsApiResponse = await response.json();
      
      if (result.success && result.data) {
        setTextsData(result.data);
        if (result.pagination) {
          setTextsPagination(result.pagination);
        }
      } else {
        console.error('Failed to fetch texts data:', result.error);
      }
    } catch (err) {
      console.error('Error fetching texts data:', err);
    } finally {
      setTextsLoading(false);
    }
  };

  useEffect(() => {
    fetchTextsData();
  }, []);

  const handlePageChange = (page: number) => {
    fetchTextsData(page, textsPagination.limit);
  };

  const handlePageSizeChange = (limit: number) => {
    fetchTextsData(1, limit);
  };

  return {
    chartData,
    chartLoading,
    chartError,
    textsData,
    textsLoading,
    textsPagination,
    handlePageChange,
    handlePageSizeChange
  };
}