"use client"

// import { UniversalAreaChart } from "@/components/charts/UniversalAreaChart"
// import { useChartData } from "@/hooks/useChartData"
// import { relationshipConfig } from "@/config/chartConfigs"
import { TextsDataTableEditable } from "@/components/tables/texts-data-table-editable"
// Removed SectionCards import
import { useEffect, useState, useCallback } from "react"
// import { RelationshipDataPoint, BaseDataPoint } from "@/types/chart"

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
  // const { data: chartData, loading: chartLoading, error: chartError } = 
  //   useChartData<RelationshipDataPoint>(relationshipConfig.apiEndpoint);

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
        setTextsData([]); // Ensure empty array on error
      }
    } catch (err) {
      console.error('Error fetching texts data:', err);
    } finally {
      setTextsLoading(false);
    }
  };

  // Fetch messages for a specific month based on the selected data point
  const fetchMessagesForMonth = useCallback(async (dataPoint: any) => {
    setSelectedMonthLoading(true);
    try {
      // Extract month and year from the data point
      // Assuming the date format is "Jan 2024" or similar
      const dateStr = dataPoint['date'] || dataPoint['month'] || ''; // relationshipConfig.chartConfig.xAxisKey
      console.log('Date string from data point:', dateStr);
      console.log('Full data point:', dataPoint);
      
      // Try different date parsing approaches
      let year, month;
      
      // First try parsing "Jan 2024" format
      const monthYearMatch = dateStr.match(/^(\w+)\s+(\d{4})$/);
      if (monthYearMatch) {
        const monthName = monthYearMatch[1];
        year = parseInt(monthYearMatch[2]);
        const date = new Date(Date.parse(monthName + " 1, " + year));
        month = date.getMonth();
      } else {
        // Fallback to direct parsing
        const date = new Date(Date.parse(dateStr + " 1"));
        year = date.getFullYear();
        month = date.getMonth();
      }
      
      // Calculate start and end dates for the month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59); // Last day of month
      
      console.log('Fetching messages for date range:', {
        dateStr,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      // Fetch messages for this date range
      const url = `/api/texts-bc?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}&limit=1000`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: TextsApiResponse = await response.json();
      
      console.log('API response:', result);
      console.log('Messages data:', result.data);
      
      if (result.success && result.data) {
        setSelectedMonthMessages(result.data);
        console.log(`Loaded ${result.data.length} messages for ${dateStr}`);
        if (result.data.length > 0) {
          console.log('First message date:', result.data[0].date_time);
          console.log('Last message date:', result.data[result.data.length - 1].date_time);
        }
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

  const handleDeleteRow = async (id: number) => {
    if (!confirm(`Are you sure you want to delete message #${id}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/texts-bc/delete?id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json() as { success: boolean; error?: string };
      
      if (result.success) {
        // Remove from local data
        setTextsData(prev => prev.filter(item => item.id !== id));
        // Update pagination total
        setTextsPagination(prev => ({
          ...prev,
          total: prev.total - 1,
          totalPages: Math.ceil((prev.total - 1) / prev.limit)
        }));
      } else {
        console.error('Failed to delete:', result.error);
        alert(`Failed to delete message: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting row:', error);
      alert('Error deleting message');
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 bg-white">
      
      {/* Chart temporarily disabled - UniversalAreaChart component missing */}
      {/* <div className="px-4 lg:px-6">
        <UniversalAreaChart 
          data={chartData}
          loading={chartLoading}
          error={chartError}
          config={relationshipConfig.chartConfig}
          onDataPointSelect={fetchMessagesForMonth}
          messages={selectedMonthMessages}
          messagesLoading={selectedMonthLoading}
        />
      </div> */}
      
      <div className="px-4 lg:px-6">
        <div className="mt-6 mb-6 flex items-center justify-between">
          <div>
            <h2 className="leading-none font-semibold" style={{ color: 'oklch(0.61 0.27 19.72)' }}>Text Messages</h2>
            <p className="text-gray-600"> </p>
          </div>
          <a 
            href="/chris-messages" 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
          >
            View Chris-tagged messages →
          </a>
        </div>
        <TextsDataTableEditable 
          data={textsData}
          loading={textsLoading}
          pagination={textsPagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onUpdateRow={handleUpdateRow}
          onDeleteRow={handleDeleteRow}
        />
      </div>
    </div>
  )
}