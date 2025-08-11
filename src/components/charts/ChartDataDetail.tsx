"use client"

import * as React from "react"
import { BaseDataPoint, ChartConfig } from "@/types/chart"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, User, CalendarDays } from "lucide-react"

interface TextMessage {
  id: number
  date_time: string
  sender: string
  message: string
  sentiment: string
  category: string
  tag: string
  conflict_detected?: boolean
}

interface ChartDataDetailProps {
  dataPoint: BaseDataPoint | null
  config: ChartConfig
  allData?: BaseDataPoint[]
  messages?: TextMessage[]
  messagesLoading?: boolean
}

export function ChartDataDetail({ dataPoint, config, allData = [], messages = [], messagesLoading = false }: ChartDataDetailProps) {
  if (!dataPoint) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-4xl mb-2">📊</div>
        <p>Click on a data point to see details</p>
      </div>
    )
  }

  // Calculate position in dataset
  const dataIndex = allData.findIndex(item => 
    item[config.xAxisKey] === dataPoint[config.xAxisKey]
  )
  const position = dataIndex + 1
  const total = allData.length

  // Calculate trend vs previous period
  const previousPoint = dataIndex > 0 ? allData[dataIndex - 1] : null
  const currentValue = Number(dataPoint[config.yAxisKey]) || 0
  const previousValue = previousPoint ? Number(previousPoint[config.yAxisKey]) || 0 : null
  
  let trend: 'up' | 'down' | 'stable' | null = null
  let trendPercentage = 0
  
  if (previousValue !== null && previousValue !== 0) {
    const change = currentValue - previousValue
    trendPercentage = Math.abs((change / previousValue) * 100)
    
    if (Math.abs(change) < (previousValue * 0.05)) {
      trend = 'stable'
    } else if (change > 0) {
      trend = 'up'
    } else {
      trend = 'down'
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50 border-green-200'
      case 'down': return 'text-red-600 bg-red-50 border-red-200'
      case 'stable': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      case 'stable': return '➡️'
      default: return '📊'
    }
  }

  const getTrendText = () => {
    if (!trend || !previousValue) return 'No comparison data'
    
    switch (trend) {
      case 'up': return `+${trendPercentage.toFixed(1)}% vs previous`
      case 'down': return `-${trendPercentage.toFixed(1)}% vs previous`
      case 'stable': return 'Stable vs previous'
      default: return 'No trend data'
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Value Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            {config.yAxisLabel}
          </CardTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {config.formatters?.yAxis 
                ? config.formatters.yAxis(currentValue)
                : currentValue.toFixed(1)
              }
            </span>
            {trend && (
              <Badge variant="outline" className={getTrendColor()}>
                {getTrendIcon()} {trend}
              </Badge>
            )}
          </div>
          <CardDescription>
            {dataPoint[config.xAxisKey]} • {position} of {total}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Image Placeholder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Monthly Photo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative w-full aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📸</div>
              <p className="text-sm text-gray-500">Image placeholder</p>
              <p className="text-xs text-gray-400 mt-1">Upload photo for {dataPoint[config.xAxisKey]}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Information */}
      {trend && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${getTrendColor()}`}>
                <span className="text-lg">{getTrendIcon()}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 capitalize">{trend} trend</p>
                <p className="text-sm text-gray-600">{getTrendText()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Point Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Data Point Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {Object.entries(dataPoint).map(([key, value]) => {
              // Skip the main axis keys as they're already displayed
              if (key === config.xAxisKey || key === config.yAxisKey) return null
              
              return (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {typeof value === 'string' && value.length > 50 
                      ? `${value.substring(0, 50)}...`
                      : String(value) || 'N/A'
                    }
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Context Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Dataset Context
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Position:</span>
              <span className="font-medium">{position} of {total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Period:</span>
              <span className="font-medium">{dataPoint[config.xAxisKey]}</span>
            </div>
            {allData.length > 0 && (
              <>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-600">Dataset avg:</span>
                  <span className="font-medium">
                    {config.formatters?.yAxis 
                      ? config.formatters.yAxis(
                          allData.reduce((sum, item) => sum + (Number(item[config.yAxisKey]) || 0), 0) / allData.length
                        )
                      : (allData.reduce((sum, item) => sum + (Number(item[config.yAxisKey]) || 0), 0) / allData.length).toFixed(1)
                    }
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Text Messages from Month */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messages from {dataPoint[config.xAxisKey]}
          </CardTitle>
          <CardDescription>
            {messages.length} messages found
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {messagesLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No messages found for this period
            </p>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {messages.map((msg, index) => {
                  const msgDate = new Date(msg.date_time)
                  const sentimentColors = {
                    positive: 'bg-green-50 text-green-700 border-green-200',
                    negative: 'bg-red-50 text-red-700 border-red-200',
                    neutral: 'bg-gray-50 text-gray-700 border-gray-200'
                  }
                  
                  return (
                    <div 
                      key={msg.id || index} 
                      className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      {/* Message Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm text-gray-900">
                            {msg.sender}
                          </span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${sentimentColors[msg.sentiment as keyof typeof sentimentColors] || sentimentColors.neutral}`}
                        >
                          {msg.sentiment}
                        </Badge>
                      </div>
                      
                      {/* Message Content */}
                      <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                        {msg.message}
                      </p>
                      
                      {/* Message Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <CalendarDays className="h-3 w-3" />
                          <span>
                            {msgDate.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex gap-1">
                          {msg.category && (
                            <Badge variant="outline" className="text-xs">
                              {msg.category}
                            </Badge>
                          )}
                          {msg.tag && (
                            <Badge variant="outline" className="text-xs">
                              {msg.tag}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}