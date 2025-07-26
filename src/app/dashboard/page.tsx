'use client';

import React, { useState, useCallback } from 'react';

interface ApiInsights {
  totalChunks: number;
  averageEmotionalIntensity: number;
  averageIntimacyLevel: number;
  averageSupportLevel: number;
  averageConflictLevel: number;
  contextTypeDistribution: Array<{
    context_type: string;
    count: number;
    avg_emotion: number;
  }>;
  emotionalTrend: Array<{
    date: string;
    emotion: number;
    intimacy: number;
    support: number;
    conflict: number;
  }>;
  communicationPatterns: Array<{
    pattern: string;
    frequency: number;
    avg_emotion: number;
  }>;
  relationshipArc: Array<{
    month: string;
    emotional_health: number;
    conversations: number;
  }>;
  topTags: Array<{
    tag: string;
    frequency: number;
    emotional_context: string;
  }>;
}

interface ApiChunk {
  chunk_id: string;
  start_time: string;
  end_time: string;
  message_count: number;
  context_type: string;
  emotional_intensity: number;
  intimacy_level: number;
  support_level: number;
  conflict_level: number;
  communication_pattern: string;
  temporal_context: string;
  relationship_dynamics: string;
  tags_json: string;
  chunk_preview: string;
}

interface RelationshipInsights {
  relationshipHealth: {
    overall: number;
    emotional: number;
    communication: number;
    support: number;
    intimacy: number;
    conflictResolution: number;
  };
  keyMoments: Array<{
    date: string;
    type: 'high' | 'low' | 'breakthrough';
    description: string;
    emotionalIntensity: number;
    messages: Array<{
      timestamp: string;
      sender: string;
      content: string;
      emotional_context?: string;
    }>;
  }>;
  patterns: Array<{
    name: string;
    frequency: number;
    impact: string;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  recommendations: Array<{
    category: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export default function RelationshipDashboard() {
  const [insights, setInsights] = useState<RelationshipInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/conversation-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeRange: 'all',
          filterContext: 'all'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as { 
        success: boolean; 
        error?: string; 
        insights?: Partial<ApiInsights>; 
        chunks?: ApiChunk[];
        message?: string;
      };
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate insights');
      }

      // Transform API data to match our interface
      const apiInsights = data.insights || {};
      const chunks = data.chunks || [];
      
      // Calculate overall relationship health from API metrics
      const emotional = apiInsights.averageEmotionalIntensity || 0;
      const support = apiInsights.averageSupportLevel || 0;
      const intimacy = apiInsights.averageIntimacyLevel || 0;
      const conflictResolution = Math.max(0, 10 - (apiInsights.averageConflictLevel || 0));
      const communication = (emotional + support) / 2;
      const overall = (emotional + support + intimacy + conflictResolution + communication) / 5;

      // Transform communication patterns from API
      const patterns = (apiInsights.communicationPatterns || []).slice(0, 3).map((pattern) => ({
        name: pattern.pattern || 'Unknown Pattern',
        frequency: Math.round(pattern.frequency * 10) || 0,
        impact: pattern.avg_emotion > 7 ? 'Positive emotional impact' : 
               pattern.avg_emotion > 5 ? 'Moderate emotional impact' : 'Needs attention',
        trend: 'stable' as const
      }));

      // Create key moments from recent chunks
      const keyMoments = chunks.slice(0, 3).map((chunk) => {
        const intensity = chunk.emotional_intensity || 5;
        const type = intensity > 7 ? 'high' : intensity < 4 ? 'low' : 'breakthrough';
        
        return {
          date: new Date(chunk.start_time || Date.now()).toISOString().split('T')[0],
          type: type as 'high' | 'low' | 'breakthrough',
          description: chunk.temporal_context || `Conversation analysis from ${chunk.context_type || 'general'} context`,
          emotionalIntensity: intensity,
          messages: [
            {
              timestamp: chunk.start_time || new Date().toISOString(),
              sender: 'Conversation',
              content: chunk.chunk_preview || 'Conversation data available',
              emotional_context: chunk.relationship_dynamics || 'General relationship context'
            }
          ]
        };
      });

      // Generate recommendations based on API data
      const recommendations = [];
      
      if ((apiInsights.averageConflictLevel || 0) > 5) {
        recommendations.push({
          category: 'Conflict Resolution',
          suggestion: 'Focus on reducing conflict patterns identified in your conversations',
          priority: 'high' as const
        });
      }
      
      if ((apiInsights.averageIntimacyLevel || 0) < 6) {
        recommendations.push({
          category: 'Intimacy',
          suggestion: 'Work on deepening emotional intimacy through more personal conversations',
          priority: 'high' as const
        });
      }
      
      if ((apiInsights.averageSupportLevel || 0) > 8) {
        recommendations.push({
          category: 'Communication',
          suggestion: 'Your support patterns are excellent - maintain this strength',
          priority: 'low' as const
        });
      }

      const transformedInsights: RelationshipInsights = {
        relationshipHealth: {
          overall: Math.round(overall * 10) / 10,
          emotional: Math.round(emotional * 10) / 10,
          communication: Math.round(communication * 10) / 10,
          support: Math.round(support * 10) / 10,
          intimacy: Math.round(intimacy * 10) / 10,
          conflictResolution: Math.round(conflictResolution * 10) / 10,
        },
        keyMoments,
        patterns,
        recommendations
      };

      setInsights(transformedInsights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBg = (score: number) => {
    if (score >= 8) return 'bg-green-500/20 border-green-500/30';
    if (score >= 6) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Relationship Intelligence Dashboard
          </h1>
          <p className="text-blue-700 text-lg">
            Deep insights into your relationship patterns and health
          </p>
        </div>

        {!insights && !loading && (
          <div className="text-center">
            <button
              onClick={generateInsights}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Generate Insights
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center text-white">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
            <p>Analyzing your relationship data...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 bg-red-900/20 rounded-lg p-4 mb-6">
            Error: {error}
          </div>
        )}

        {insights && (
          <div className="space-y-8">
            {/* Relationship Health Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(insights.relationshipHealth).map(([key, value]) => (
                <div
                  key={key}
                  className={`rounded-xl p-4 border backdrop-blur-sm ${getHealthBg(value)}`}
                >
                  <div className={`text-2xl font-bold ${getHealthColor(value)}`}>
                    {value.toFixed(1)}
                  </div>
                  <div className="text-purple-200 text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>

            {/* Key Moments */}
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur border border-purple-800/30">
              <h2 className="text-2xl font-bold text-white mb-6">Key Relationship Moments</h2>
              <div className="space-y-4">
                {insights.keyMoments.map((moment, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-300">{moment.date}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        moment.type === 'high' ? 'bg-green-500/20 text-green-400' :
                        moment.type === 'low' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {moment.type}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">{moment.description}</h3>
                    <div className="space-y-2">
                      {moment.messages.map((message, msgIndex) => (
                        <div key={msgIndex} className="bg-white/5 rounded p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-purple-400 font-medium">{message.sender}</span>
                            <span className="text-purple-300 text-xs">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-purple-100 mb-1">{message.content}</p>
                          {message.emotional_context && (
                            <p className="text-purple-400 text-sm italic">{message.emotional_context}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication Patterns */}
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur border border-purple-800/30">
              <h2 className="text-2xl font-bold text-white mb-6">Communication Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.patterns.map((pattern, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">{pattern.name}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-300">Frequency:</span>
                      <span className="text-purple-100">{pattern.frequency}%</span>
                    </div>
                    <p className="text-purple-200 text-sm mb-2">{pattern.impact}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      pattern.trend === 'increasing' ? 'bg-green-500/20 text-green-400' :
                      pattern.trend === 'decreasing' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {pattern.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur border border-purple-800/30">
              <h2 className="text-2xl font-bold text-white mb-6">Personalized Recommendations</h2>
              <div className="space-y-3">
                {insights.recommendations.map((rec, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-purple-400 font-medium">{rec.category}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>
                      <p className="text-purple-100">{rec.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}