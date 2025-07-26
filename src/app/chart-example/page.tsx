"use client"

import { UniversalAreaChart } from "@/components/charts/UniversalAreaChart"
import { useChartData } from "@/hooks/useChartData"
import { relationshipConfig } from "@/config/chartConfigs"
import { TextsDataTable } from "@/components/texts-data-table"
import { SectionCards } from "@/components/section-cards"
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
  // ✅ SMART CHART DATA - Replaces your old chart state/fetch logic
  const { data: chartData, loading: chartLoading, error: chartError } = 
    useChartData<RelationshipDataPoint>(relationshipConfig.apiEndpoint);

  // ✅ CUSTOM DATA - Your existing logic stays exactly the same
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

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      
      {/* ✅ SMART CHART - Just swap the component! */}
      <div className="px-4 lg:px-6">
        <UniversalAreaChart 
          data={chartData}
          loading={chartLoading}
          error={chartError}
          config={relationshipConfig.chartConfig}
        />
      </div>
      
      {/* ✅ CUSTOM CONTENT - Stays exactly the same */}
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Text Messages</h2>
          <p className="text-muted-foreground">Recent messages from the texts-bc table</p>
        </div>
        <TextsDataTable 
          data={textsData}
          loading={textsLoading}
          pagination={textsPagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  )
}