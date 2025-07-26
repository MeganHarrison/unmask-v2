# 🎯 Hybrid Page Patterns - Smart Charts + Custom Content

## Pattern 1: Replace Chart Component Only (Minimal Change)

Your existing page structure stays the same, just swap the chart component:

```typescript
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
  // ✅ SMART CHART DATA (replaces your old chart state/fetch logic)
  const { data: chartData, loading: chartLoading, error: chartError } = 
    useChartData<RelationshipDataPoint>(relationshipConfig.apiEndpoint);

  // ✅ CUSTOM DATA (your existing logic stays the same)
  const [textsData, setTextsData] = useState<TextMessage[]>([]);
  const [textsLoading, setTextsLoading] = useState(true);
  const [textsPagination, setTextsPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // Your existing texts data logic stays exactly the same
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
```

**What Changed:**
- ❌ Removed: 15 lines of chart state/fetch logic
- ✅ Added: 1 line using the smart hook
- ✅ Added: 1 import for the smart component
- ✅ Result: Same functionality, 50% less code

---

## Pattern 2: Multi-Chart Smart Hook (Multiple Charts on One Page)

If you want multiple smart charts on the same page:

```typescript
"use client"

import { UniversalAreaChart } from "@/components/charts/UniversalAreaChart"
import { useChartData } from "@/hooks/useChartData"
import { relationshipConfig, salesConfig } from "@/config/chartConfigs"
import { TextsDataTable } from "@/components/texts-data-table"
import { SectionCards } from "@/components/section-cards"
import { RelationshipDataPoint, SalesDataPoint } from "@/types/chart"

export default function DashboardPage() {
  // ✅ MULTIPLE SMART CHARTS
  const { data: relationshipData, loading: relationshipLoading, error: relationshipError } = 
    useChartData<RelationshipDataPoint>(relationshipConfig.apiEndpoint);
    
  const { data: salesData, loading: salesLoading, error: salesError } = 
    useChartData<SalesDataPoint>(salesConfig.apiEndpoint);

  // Your custom data logic here...

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      
      {/* Relationship Chart */}
      <div className="px-4 lg:px-6">
        <UniversalAreaChart 
          data={relationshipData}
          loading={relationshipLoading}
          error={relationshipError}
          config={relationshipConfig.chartConfig}
        />
      </div>
      
      {/* Sales Chart */}
      <div className="px-4 lg:px-6">
        <UniversalAreaChart 
          data={salesData}
          loading={salesLoading}
          error={salesError}
          config={salesConfig.chartConfig}
        />
      </div>
      
      {/* Your custom content */}
      <div className="px-4 lg:px-6">
        {/* TextsDataTable, etc. */}
      </div>
    </div>
  )
}
```

---

## Pattern 3: Custom Hook for Complex Data (Best of Both Worlds)

Create a hook that handles ALL your page data, both smart and custom:

```typescript
// hooks/usePageData.ts
"use client"

import { useState, useEffect } from 'react';
import { useChartData } from './useChartData';
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

interface TextsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useUnmaskPageData() {
  // Smart chart data
  const chartData = useChartData<RelationshipDataPoint>('/api/relationship-tracker');
  
  // Custom texts data
  const [textsData, setTextsData] = useState<TextMessage[]>([]);
  const [textsLoading, setTextsLoading] = useState(true);
  const [textsPagination, setTextsPagination] = useState<TextsPagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  const fetchTextsData = async (page: number = 1, limit: number = 50) => {
    setTextsLoading(true);
    try {
      const response = await fetch(`/api/texts-bc?page=${page}&limit=${limit}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setTextsData(result.data);
        if (result.pagination) {
          setTextsPagination(result.pagination);
        }
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
    // Chart data
    chartData: chartData.data,
    chartLoading: chartData.loading,
    chartError: chartData.error,
    
    // Texts data
    textsData,
    textsLoading,
    textsPagination,
    handlePageChange,
    handlePageSizeChange,
    refetchTexts: () => fetchTextsData(textsPagination.page, textsPagination.limit)
  };
}
```

Then your page becomes super clean:

```typescript
// page.tsx - Ultra Clean Version
"use client"

import { UniversalAreaChart } from "@/components/charts/UniversalAreaChart"
import { relationshipConfig } from "@/config/chartConfigs"
import { TextsDataTable } from "@/components/texts-data-table"
import { SectionCards } from "@/components/section-cards"
import { useUnmaskPageData } from "@/hooks/usePageData"

export default function Page() {
  const {
    chartData,
    chartLoading,
    chartError,
    textsData,
    textsLoading,
    textsPagination,
    handlePageChange,
    handlePageSizeChange
  } = useUnmaskPageData();

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      
      <div className="px-4 lg:px-6">
        <UniversalAreaChart 
          data={chartData}
          loading={chartLoading}
          error={chartError}
          config={relationshipConfig.chartConfig}
        />
      </div>
      
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
```

---

## Pattern 4: Flexible Chart Section Component

Create a reusable section component for when you need chart + custom content:

```typescript
// components/sections/ChartSection.tsx
"use client"

import { UniversalAreaChart } from "@/components/charts/UniversalAreaChart"
import { useChartData } from "@/hooks/useChartData"
import { PageConfig, BaseDataPoint } from "@/types/chart"

interface ChartSectionProps {
  config: PageConfig;
  className?: string;
  children?: React.ReactNode; // Custom content after chart
}

export function ChartSection({ config, className, children }: ChartSectionProps) {
  const { data, loading, error } = useChartData<BaseDataPoint>(config.apiEndpoint);

  return (
    <div className={`px-4 lg:px-6 ${className || ''}`}>
      <UniversalAreaChart 
        data={data}
        loading={loading}
        error={error}
        config={config.chartConfig}
      />
      {children}
    </div>
  );
}
```

Usage in your page:

```typescript
export default function Page() {
  // Your custom data logic here...

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      
      {/* Smart Chart Section */}
      <ChartSection config={relationshipConfig} />
      
      {/* Custom Content Section */}
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
```

---

## 🎯 Which Pattern to Choose?

**Pattern 1 (Replace Component Only):** 
- ✅ Minimal changes to existing code
- ✅ Perfect for your current situation
- ✅ Gradual migration strategy

**Pattern 2 (Multi-Chart):**
- ✅ Multiple charts on one page
- ✅ Each chart independently managed
- ✅ Good for dashboards

**Pattern 3 (Custom Page Hook):**
- ✅ Cleanest page code
- ✅ Reusable across similar pages
- ✅ Best for complex data relationships

**Pattern 4 (Chart Sections):**
- ✅ Maximum flexibility
- ✅ Mix and match components
- ✅ Best for varied page layouts

---

## 🚀 Migration Strategy for Your Page

**Step 1:** Start with Pattern 1 (minimal change)
**Step 2:** Once comfortable, move to Pattern 3 (custom hook)
**Step 3:** Scale to Pattern 4 for maximum flexibility

This gives you the smart chart benefits while keeping all your existing functionality intact!
