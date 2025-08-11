// components/insights/InsightsPage.tsx - Enhanced insights page
'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Search, Filter } from 'lucide-react';
import { useMemoryAgent } from '@/lib/hooks/useMemoryAgent';

export function InsightsPage() {
  const { getInsights, analyzePatterns, isLoading } = useMemoryAgent();
  const [insights, setInsights] = useState<string[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  useEffect(() => {
    loadData();
  }, [selectedTimeframe]);

  const loadData = async () => {
    try {
      // Load general insights
      const insightsResponse = await getInsights();
      if (insightsResponse?.insights) {
        setInsights(insightsResponse.insights);
      }

      // Load patterns for selected timeframe
      const timeframe = getTimeframeData(selectedTimeframe);
      const patternsResponse = await analyzePatterns(timeframe);
      if (patternsResponse?.patterns) {
        setPatterns(patternsResponse.patterns);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const getTimeframeData = (timeframe: string) => {
    const now = new Date();
    const days = parseInt(timeframe);
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return {
      start: start.toISOString(),
      end: now.toISOString()
    };
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Relationship Insights
          </h1>
          <p className="text-gray-600">
            Deep analysis of your communication patterns and relationship dynamics
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Time Period:</span>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="365d">Last year</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your relationship data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Key Insights */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Key Insights
              </h2>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-900">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication Patterns */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Communication Patterns
              </h2>
              <div className="space-y-4">
                {patterns.map((pattern, index) => (
                  <PatternCard key={index} pattern={pattern} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PatternCard({ pattern }: { pattern: any }) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'declining': return 'text-red-600 bg-red-50';
      case 'stable': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '↗';
      case 'declining': return '↘';
      case 'stable': return '→';
      default: return '~';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900">{pattern.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(pattern.trend)}`}>
          {getTrendIcon(pattern.trend)} {pattern.trend}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{pattern.timeframe}</span>
        <span>{Math.round(pattern.confidence * 100)}% confidence</span>
      </div>
    </div>
  );
}