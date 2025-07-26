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