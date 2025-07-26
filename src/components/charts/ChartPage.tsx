"use client"

import { UniversalAreaChart } from "./UniversalAreaChart"
import { useChartData } from "@/hooks/useChartData"
import { BaseDataPoint, PageConfig } from "@/types/chart"

interface ChartPageProps {
  config: PageConfig;
  children?: React.ReactNode;
}

export function ChartPage({ config, children }: ChartPageProps) {
  const { data, loading, error } = useChartData<BaseDataPoint>(
    config.apiEndpoint
  );

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {children}
      <div className="px-4 lg:px-6">
        <UniversalAreaChart
          data={data}
          loading={loading}
          error={error}
          config={config.chartConfig}
          className={config.className}
        />
      </div>
    </div>
  );
}