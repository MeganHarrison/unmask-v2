import { PageConfig } from "@/types/chart";

// Relationship Tracker Config
export const relationshipConfig: PageConfig = {
  apiEndpoint: "/api/relationship-tracker",
  chartConfig: {
    title: "Relationship Progression",
    description: "Monthly relationship scale tracking from your data (1-10)",
    xAxisKey: "month",
    yAxisKey: "scale",
    yAxisLabel: "Relationship Scale",
    yAxisDomain: [0, 10],
    color: "hsl(var(--primary))",
    aggregationType: "average",
    timeRanges: ["all", "12m", "6m", "3m"],
    formatters: {
      yAxis: (value) => `${value}/10`,
      tooltip: (value) => `${value}/10`
    }
  }
};