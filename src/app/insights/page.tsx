// app/insights/page.tsx
// The actual insights page that shows AI analysis

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Heart, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface InsightsData {
  relationshipHealth: number;
  communicationQuality: number;
  emotionalIntimacy: number;
  conflictResolution: number;
  keyStrengths: string[];
  areasForGrowth: string[];
  recentTrends: string;
  actionableInsights: string[];
  messageCount: number;
  conflictRate?: number;
  fallbackAnalysis?: boolean;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [analysisType, setAnalysisType] = useState('overview');

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/insights/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeRange, analysisType })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setInsights(data.insights);
      
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          <Brain className="inline mr-2 h-8 w-8" />
          Relationship Insights
        </h1>
        <p className="text-gray-600">
          GPT-4 powered analysis of your communication patterns and emotional dynamics
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Settings</CardTitle>
          <CardDescription>
            Generate insights based on different time periods and analysis types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Time Range</label>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Analysis Type</label>
              <select 
                value={analysisType} 
                onChange={(e) => setAnalysisType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Relationship Overview</option>
                <option value="emotional_patterns">Emotional Patterns</option>
                <option value="conflict_analysis">Conflict Analysis</option>
              </select>
            </div>
          </div>
          
          <Button onClick={generateInsights} disabled={loading}>
            {loading ? 'Analyzing...' : 'Generate New Insights'}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center text-red-700">
              <AlertTriangle className="mr-2 h-5 w-5" />
              <span className="font-semibold">Analysis Error</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="mx-auto h-12 w-12 text-blue-500 animate-pulse mb-4" />
            <p className="text-gray-600">Analyzing your relationship patterns...</p>
            <p className="text-sm text-gray-500 mt-2">This may take up to 30 seconds</p>
          </CardContent>
        </Card>
      )}

      {/* Insights Display */}
      {insights && !loading && (
        <div className="space-y-6">
          {/* Relationship Health Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={getHealthBgColor(insights.relationshipHealth || 0)}>
              <CardContent className="p-6 text-center">
                <Heart className={`mx-auto h-8 w-8 mb-2 ${getHealthColor(insights.relationshipHealth || 0)}`} />
                <h3 className="text-sm font-medium text-gray-600">Relationship Health</h3>
                <p className={`text-3xl font-bold ${getHealthColor(insights.relationshipHealth || 0)}`}>
                  {(insights.relationshipHealth || 0).toFixed(1)}/10
                </p>
              </CardContent>
            </Card>

            <Card className={getHealthBgColor(insights.communicationQuality || 0)}>
              <CardContent className="p-6 text-center">
                <TrendingUp className={`mx-auto h-8 w-8 mb-2 ${getHealthColor(insights.communicationQuality || 0)}`} />
                <h3 className="text-sm font-medium text-gray-600">Communication Quality</h3>
                <p className={`text-3xl font-bold ${getHealthColor(insights.communicationQuality || 0)}`}>
                  {(insights.communicationQuality || 0).toFixed(1)}/10
                </p>
              </CardContent>
            </Card>

            {insights.emotionalIntimacy && (
              <Card className={getHealthBgColor(insights.emotionalIntimacy)}>
                <CardContent className="p-6 text-center">
                  <Heart className={`mx-auto h-8 w-8 mb-2 ${getHealthColor(insights.emotionalIntimacy)}`} />
                  <h3 className="text-sm font-medium text-gray-600">Emotional Intimacy</h3>
                  <p className={`text-3xl font-bold ${getHealthColor(insights.emotionalIntimacy)}`}>
                    {insights.emotionalIntimacy.toFixed(1)}/10
                  </p>
                </CardContent>
              </Card>
            )}

            {insights.conflictResolution && (
              <Card className={getHealthBgColor(insights.conflictResolution)}>
                <CardContent className="p-6 text-center">
                  <Lightbulb className={`mx-auto h-8 w-8 mb-2 ${getHealthColor(insights.conflictResolution)}`} />
                  <h3 className="text-sm font-medium text-gray-600">Conflict Resolution</h3>
                  <p className={`text-3xl font-bold ${getHealthColor(insights.conflictResolution)}`}>
                    {insights.conflictResolution.toFixed(1)}/10
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Strengths and Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">💪 Key Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.keyStrengths?.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {strength}
                    </Badge>
                  )) || (
                    <p className="text-gray-500">No specific strengths identified in this analysis.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-700">🎯 Areas for Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.areasForGrowth?.map((area, index) => (
                    <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                      {area}
                    </Badge>
                  )) || (
                    <p className="text-gray-500">No specific growth areas identified in this analysis.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trends */}
          {insights.recentTrends && (
            <Card>
              <CardHeader>
                <CardTitle>📈 Recent Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{insights.recentTrends}</p>
              </CardContent>
            </Card>
          )}

          {/* Actionable Insights */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Actionable Insights</CardTitle>
              <CardDescription>
                Specific recommendations based on your communication patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.actionableInsights?.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{insight}</p>
                  </div>
                )) || (
                  <p className="text-gray-500">No specific insights available for this analysis.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Metadata */}
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-4">
              <div className="text-xs text-gray-500 space-y-1">
                <p>Analysis based on {insights.messageCount} messages from the selected time period</p>
                {insights.conflictRate && (
                  <p>Conflict rate: {(insights.conflictRate * 100).toFixed(1)}%</p>
                )}
                {insights.fallbackAnalysis && (
                  <p className="text-orange-600">
                    ⚠️ Using pattern-based analysis (AI analysis unavailable)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}