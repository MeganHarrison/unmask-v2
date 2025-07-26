"use client"

import { useChartData } from "@/hooks/useChartData"
import { relationshipConfig } from "../../config/chartConfigs"
import { TextsDataTableEditable } from "@/components/texts-data-table-editable"
import { useEffect, useState } from "react"
import { RelationshipDataPoint } from "@/types/chart"

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

export default function Page() {
  const { data: chartData, loading: chartLoading, error: chartError } = 
    useChartData<RelationshipDataPoint>(relationshipConfig.apiEndpoint);

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

  const handleUpdateRow = async (id: number, field: string, value: string) => {
    try {
      const response = await fetch('/api/texts-bc/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field, value })
      });
      
      const result = await response.json() as { success: boolean; error?: string };
      
      if (result.success) {
        // Update local data
        setTextsData(prev => 
          prev.map(item => 
            item.id === id ? { ...item, [field]: value } : item
          )
        );
      } else {
        console.error('Failed to update:', result.error);
      }
    } catch (error) {
      console.error('Error updating row:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 bg-white">
        <TextsDataTableEditable 
          data={textsData}
          loading={textsLoading}
          pagination={textsPagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onUpdateRow={handleUpdateRow}
        />
      </div>
  )
}