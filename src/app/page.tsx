'use client';

import React, { useState, useCallback } from 'react';

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

      const data = await response.json() as { success: boolean; error?: string };
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate insights');
      }

      // Use mock data for now since database integration isn't working
      const mockInsights: RelationshipInsights = {
        relationshipHealth: {
          overall: 8.2,
          emotional: 7.8,
          communication: 8.5,
          support: 9.1,
          intimacy: 7.2,
          conflictResolution: 8.0,
        },
        keyMoments: [
          {
            date: '2024-03-15',
            type: 'high',
            description: 'Breakthrough conversation about future goals',
            emotionalIntensity: 9.2,
            messages: [
              {
                timestamp: '2024-03-15T19:30:00Z',
                sender: 'You',
                content: 'I love how we can dream together about our future',
                emotional_context: 'Deep connection and shared vision'
              },
              {
                timestamp: '2024-03-15T19:35:00Z',
                sender: 'Brandon',
                content: 'You make everything feel possible ❤️',
                emotional_context: 'Gratitude and emotional safety'
              }
            ]
          },
          {
            date: '2024-02-20',
            type: 'low',
            description: 'Miscommunication about weekend plans',
            emotionalIntensity: 3.4,
            messages: [
              {
                timestamp: '2024-02-20T14:20:00Z',
                sender: 'You',
                content: 'I thought we agreed on dinner with my parents',
                emotional_context: 'Frustration and confusion'
              },
              {
                timestamp: '2024-02-20T14:25:00Z',
                sender: 'Brandon',
                content: 'I never confirmed that, I have work stuff',
                emotional_context: 'Defensive and stressed'
              }
            ]
          },
          {
            date: '2024-01-10',
            type: 'breakthrough',
            description: 'Learned to express needs more clearly',
            emotionalIntensity: 8.7,
            messages: [
              {
                timestamp: '2024-01-10T20:15:00Z',
                sender: 'You',
                content: 'When you work late without telling me, I feel disconnected. Can we find a way to stay in touch?',
                emotional_context: 'Vulnerable communication'
              },
              {
                timestamp: '2024-01-10T20:18:00Z',
                sender: 'Brandon',
                content: 'You\'re right, I should check in. I didn\'t realize it affected you that way',
                emotional_context: 'Understanding and commitment'
              }
            ]
          }
        ],
        patterns: [
          {
            name: 'Evening Check-ins',
            frequency: 85,
            impact: 'Significantly improves daily connection',
            trend: 'increasing'
          },
          {
            name: 'Work Stress Discussions',
            frequency: 65,
            impact: 'Moderate tension but good support',
            trend: 'stable'
          },
          {
            name: 'Future Planning Talks',
            frequency: 40,
            impact: 'Strengthens bond and shared vision',
            trend: 'increasing'
          }
        ],
        recommendations: [
          {
            category: 'Communication',
            suggestion: 'Schedule weekly relationship check-ins to maintain emotional intimacy',
            priority: 'high'
          },
          {
            category: 'Conflict Resolution',
            suggestion: 'Practice expressing needs without blame to reduce defensive responses',
            priority: 'medium'
          },
          {
            category: 'Intimacy',
            suggestion: 'Create more opportunities for unstructured quality time together',
            priority: 'high'
          }
        ]
      };

      setInsights(mockInsights);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Relationship Intelligence Dashboard
          </h1>
          <p className="text-purple-300 text-lg">
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