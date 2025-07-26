"use client"

import { UniversalAreaChart } from "@/components/charts/UniversalAreaChart"
import { useChartData } from "@/hooks/useChartData"
import { relationshipConfig } from "@/config/chartConfigs"
import { TextsDataTableEditable } from "@/components/texts-data-table-editable"
import { SectionCards } from "@/components/section-cards"
import { useEffect, useState, useCallback } from "react"
import { RelationshipDataPoint, BaseDataPoint } from "@/types/chart"

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
  const [selectedMonthMessages, setSelectedMonthMessages] = useState<TextMessage[]>([]);
  const [selectedMonthLoading, setSelectedMonthLoading] = useState(false);

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

  // Fetch messages for a specific month based on the selected data point
  const fetchMessagesForMonth = useCallback(async (dataPoint: BaseDataPoint) => {
    setSelectedMonthLoading(true);
    try {
      // Extract month and year from the data point
      // Assuming the date format is "Jan 2024" or similar
      const dateStr = dataPoint[relationshipConfig.chartConfig.xAxisKey];
      const date = new Date(Date.parse(dateStr + " 1")); // Parse month string
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-indexed
      
      // Calculate start and end dates for the month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59); // Last day of month
      
      // Fetch messages for this date range
      const response = await fetch(`/api/texts-bc?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}&limit=100`);
      const result: TextsApiResponse = await response.json();
      
      if (result.success && result.data) {
        setSelectedMonthMessages(result.data);
      } else {
        console.error('Failed to fetch messages for month:', result.error);
        setSelectedMonthMessages([]);
      }
    } catch (err) {
      console.error('Error fetching messages for month:', err);
      setSelectedMonthMessages([]);
    } finally {
      setSelectedMonthLoading(false);
    }
  }, []);

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
      
      <div className="px-4 lg:px-6">
        <UniversalAreaChart 
          data={chartData}
          loading={chartLoading}
          error={chartError}
          config={relationshipConfig.chartConfig}
          onDataPointSelect={fetchMessagesForMonth}
          messages={selectedMonthMessages}
          messagesLoading={selectedMonthLoading}
        />
      </div>
      
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Text Messages</h2>
          <p className="text-gray-600">Recent messages from the texts-bc table</p>
        </div>
        <TextsDataTableEditable 
          data={textsData}
          loading={textsLoading}
          pagination={textsPagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onUpdateRow={handleUpdateRow}
        />
        <SectionCards />
      </div>
    </div>
  )
}