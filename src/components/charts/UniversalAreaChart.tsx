"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Dot } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile" // Update this import path if needed
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig as RechartsConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { BaseDataPoint, ChartConfig } from "@/types/chart"
import { OffCanvas } from "@/components/ui/off-canvas"
import { ChartDataDetail } from "@/components/charts/ChartDataDetail"

interface UniversalAreaChartProps {
  data?: BaseDataPoint[];
  loading?: boolean;
  error?: string;
  config: ChartConfig;
  className?: string;
  onDataPointSelect?: (dataPoint: BaseDataPoint) => void;
  messages?: any[];
  messagesLoading?: boolean;
}

export function UniversalAreaChart({ 
  data = [], 
  loading = false, 
  error, 
  config,
  className,
  onDataPointSelect,
  messages = [],
  messagesLoading = false
}: UniversalAreaChartProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("all")
  const [selectedDataPoint, setSelectedDataPoint] = React.useState<BaseDataPoint | null>(null)
  const [isOffCanvasOpen, setIsOffCanvasOpen] = React.useState(false)

  // Default time ranges if not specified
  const timeRanges = config.timeRanges || ["all", "12m", "6m", "3m"];

  // Filter data based on time range
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    if (timeRange === "all") return data;
    
    const monthsToShow = timeRange === "6m" ? 6 : timeRange === "3m" ? 3 : 12;
    return data.slice(-monthsToShow);
  }, [data, timeRange]);


  // Handle data point selection
  const handleDataPointClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const dataPoint = data.activePayload[0].payload
      setSelectedDataPoint(dataPoint)
      setIsOffCanvasOpen(true)
      // Call parent callback to fetch messages for this data point
      if (onDataPointSelect) {
        onDataPointSelect(dataPoint)
      }
    }
  }

  const handleCloseOffCanvas = () => {
    setIsOffCanvasOpen(false)
    // Keep selectedDataPoint for a moment to allow smooth closing animation
    setTimeout(() => {
      if (!isOffCanvasOpen) {
        setSelectedDataPoint(null)
      }
    }, 300)
  }

  // Dynamic chart config for recharts
  const chartConfig: RechartsConfig = {
    [config.yAxisKey]: {
      label: config.yAxisLabel,
      color: config.color || "hsl(var(--primary))",
    },
  };

  return (
    <Card className={`@container/card ${className || ''}`}>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {config.description}
          </span>
          <span className="@[540px]/card:hidden">{config.yAxisLabel}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            {timeRanges.map(range => (
              <ToggleGroupItem key={range} value={range}>
                {range === "all" ? "All Time" : `Last ${range}`}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a time range"
            >
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {timeRanges.map(range => (
                <SelectItem key={range} value={range} className="rounded-lg">
                  {range === "all" ? "All Time" : `Last ${range}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex h-[250px] items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading relationship data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-[250px] items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">⚠️ Error loading data</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">📊 No relationship data found</p>
              <p className="text-sm text-muted-foreground">Add entries to your relationship_tracker table to see your progress</p>
            </div>
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart 
                data={filteredData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                onClick={handleDataPointClick}
                className="cursor-pointer"
              >
                <defs>
                  <linearGradient id={`fill${config.yAxisKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={config.color || "hsl(var(--primary))"}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={config.color || "hsl(var(--primary))"}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey={config.xAxisKey}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={config.formatters?.xAxis || ((value) => {
                    if (isMobile && typeof value === 'string') {
                      const parts = value.split(' ');
                      return parts[0]?.slice(0, 3) || value;
                    }
                    return value;
                  })}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={config.yAxisDomain || ['dataMin', 'dataMax']}
                  tickFormatter={config.formatters?.yAxis}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => `${value} • Click for details`}
                      formatter={(value, name) => {
                        const formattedValue = config.formatters?.tooltip 
                          ? config.formatters.tooltip(value)
                          : value;
                        return [formattedValue, config.yAxisLabel];
                      }}
                      indicator="dot"
                      className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                    />
                  }
                />
                <Area
                  dataKey={config.yAxisKey}
                  type="monotone"
                  fill={`url(#fill${config.yAxisKey})`}
                  stroke={config.color || "hsl(var(--primary))"}
                  strokeWidth={2}
                  dot={<Dot 
                    r={4} 
                    stroke={config.color || "hsl(var(--primary))"} 
                    strokeWidth={2}
                    fill="white"
                    className="hover:r-6 transition-all cursor-pointer"
                  />}
                  activeDot={<Dot 
                    r={6} 
                    stroke={config.color || "hsl(var(--primary))"} 
                    strokeWidth={2}
                    fill={config.color || "hsl(var(--primary))"}
                    className="cursor-pointer"
                  />}
                />
              </AreaChart>
            </ChartContainer>
            {filteredData.length > 0 && (
              <div className="mt-4 space-y-1">
                <div className="text-xs text-muted-foreground text-center">
                  Showing {filteredData.length} data points • Last updated: {filteredData[filteredData.length - 1]?.[config.xAxisKey]}
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  💡 Click on any data point to view detailed analysis
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Off-canvas panel for data point details */}
      <OffCanvas
        isOpen={isOffCanvasOpen}
        onClose={handleCloseOffCanvas}
        title="Data Point Details"
      >
        <ChartDataDetail
          dataPoint={selectedDataPoint}
          config={config}
          allData={filteredData}
          messages={messages}
          messagesLoading={messagesLoading}
        />
      </OffCanvas>
    </Card>
  )
}