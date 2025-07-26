// Core chart interfaces
export interface BaseDataPoint {
  [key: string]: any;
}

export interface ChartConfig {
  title: string;
  description: string;
  xAxisKey: string;
  yAxisKey: string;
  yAxisLabel: string;
  yAxisDomain?: [number, number];
  color?: string;
  aggregationType?: 'sum' | 'average' | 'count' | 'latest';
  timeRanges?: string[];
  formatters?: {
    xAxis?: (value: any) => string;
    yAxis?: (value: any) => string;
    tooltip?: (value: any) => string;
  };
}

export interface PageConfig {
  apiEndpoint: string;
  chartConfig: ChartConfig;
  refreshInterval?: number;
  className?: string;
}

// Relationship tracker specific type
export interface RelationshipDataPoint extends BaseDataPoint {
  month: string;
  scale: number;
  notes?: string;
}