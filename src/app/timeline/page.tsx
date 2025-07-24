'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

const API_BASE_URL = 'https://your-unmask-api.your-subdomain.workers.dev'; // Replace with your actual Worker URL

const RelationshipTimeline = () => {
  const [timelineData, setTimelineData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [drillDownData, setDrillDownData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial timeline data
  useEffect(() => {
    loadTimelineData();
  }, []);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/timeline`);
      const data = await response.json();
      
      if (data.success) {
        setTimelineData(data.data);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load timeline data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthDetails = async (month) => {
    try {
      setSelectedMonth(month);
      setDrillDownData(null);
      setAiAnalysis(null);
      
      const response = await fetch(`${API_BASE_URL}/api/month/${month}`);
      const data = await response.json();
      
      if (data.success) {
        setDrillDownData(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load month details: ' + err.message);
    }
  };

  const generateAIAnalysis = async (month) => {
    try {
      setAnalysisLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAiAnalysis(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to generate AI analysis: ' + err.message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getBarColor = (phase) => {
    const colors = {
      'Peak Connection': '#10B981', // Emerald
      'Romantic Phase': '#F59E0B',  // Amber
      'Supportive Period': '#3B82F6', // Blue
      'Steady State': '#6B7280',   // Gray
      'Distance Phase': '#EF4444', // Red
      'Tension Period': '#DC2626'  // Dark Red
    };
    return colors[phase] || '#6B7280';
  };

  const handleBarClick = (data) => {
    loadMonthDetails(data.month);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl max-w-sm">
          <p className="text-white font-bold text-lg mb-2">{label}</p>
          <p className="text-emerald-400">Connection Level: {data.connection_level}/10</p>
          <p className="text-blue-400">{data.message_count} messages ({data.messages_per_day}/day)</p>
          <p className="text-pink-400">{data.love_expressions} love expressions</p>
          <p className="text-yellow-400">Phase: {data.relationship_phase}</p>
          {data.story_events > 0 && (
            <p className="text-purple-400">{data.story_events} major events</p>
          )}
          <p className="text-gray-400 text-sm mt-2">Click to analyze this month</p>
        </div>
      );
    }
    return null;
  };

  const AnalysisSection = ({ title, content, color = 'emerald' }) => {
    const colorClasses = {
      emerald: 'border-emerald-400 text-emerald-400',
      blue: 'border-blue-400 text-blue-400',
      purple: 'border-purple-400 text-purple-400',
      yellow: 'border-yellow-400 text-yellow-400',
      red: 'border-red-400 text-red-400',
      amber: 'border-amber-400 text-amber-400'
    };
    
    return (
      <div className={`border-l-4 ${colorClasses[color]} pl-4 mb-6`}>
        <h4 className={`font-bold text-lg mb-2 ${colorClasses[color]}`}>{title}</h4>
        <p className="text-gray-300 leading-relaxed">{content}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading Unmask Timeline</h2>
          <p className="text-gray-400">Analyzing 2.5 years of relationship data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-red-400">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={loadTimelineData}
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-lg font-semibold"
          >
            Retry Connection
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Make sure your Cloudflare Worker is deployed and the API_BASE_URL is correct
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-2">
            UNMASK: Your Relationship Timeline
          </h1>
          <p className="text-gray-400">
            {timelineData.length} months analyzed • Live data from your D1 database
          </p>
          <p className="text-emerald-400 font-semibold mt-2">Click any month to dive deep into that period</p>
        </div>

        {/* Main Chart */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Monthly Connection Levels</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                domain={[0, 10]}
                label={{ value: 'Connection Level', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="connection_level" 
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={handleBarClick}
              >
                {timelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.relationship_phase)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center"><div className="w-4 h-4 bg-emerald-500 rounded mr-2"></div>Peak Connection</div>
            <div className="flex items-center"><div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>Romantic Phase</div>
            <div className="flex items-center"><div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>Supportive Period</div>
            <div className="flex items-center"><div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>Steady State</div>
            <div className="flex items-center"><div className="w-4 h-4 bg-red-500 rounded mr-2"></div>Distance Phase</div>
          </div>
        </div>

        {/* Drill-Down Section */}
        {selectedMonth && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Deep Dive: {selectedMonth}</h2>
              <button 
                onClick={() => setSelectedMonth(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {!drillDownData ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading month details...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Data Overview */}
                <div className="space-y-6">
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4 text-emerald-400">Communication Overview</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Total Messages</p>
                        <p className="text-2xl font-bold">{drillDownData.overview.message_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Messages/Day</p>
                        <p className="text-2xl font-bold">{drillDownData.overview.messages_per_day}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Love Expressions</p>
                        <p className="text-2xl font-bold text-pink-400">{drillDownData.overview.love_expressions}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Relationship Phase</p>
                        <p className="text-lg font-semibold" style={{color: getBarColor(drillDownData.overview.relationship_phase)}}>
                          {drillDownData.overview.relationship_phase}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Daily Trends Chart */}
                  {drillDownData.daily_trends && drillDownData.daily_trends.length > 0 && (
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-xl font-bold mb-4 text-blue-400">Daily Communication Trends</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={drillDownData.daily_trends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                            labelStyle={{ color: '#F9FAFB' }}
                          />
                          <Line type="monotone" dataKey="daily_message_count" stroke="#3B82F6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Major Events */}
                  {drillDownData.context.major_events.length > 0 && (
                    <div className="bg-gray-700 rounded-lg p-6">
                      <h3 className="text-xl font-bold mb-4 text-purple-400">Major Events This Month</h3>
                      <ul className="space-y-2">
                        {drillDownData.context.major_events.map((event, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                            {event}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right Column: AI Analysis */}
                <div className="space-y-6">
                  <div className="bg-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-amber-400">🧠 AI Analysis</h3>
                      <button 
                        onClick={() => generateAIAnalysis(selectedMonth)}
                        disabled={analysisLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        {analysisLoading ? 'Analyzing...' : 'Generate Analysis'}
                      </button>
                    </div>

                    {analysisLoading && (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-2"></div>
                        <p className="text-gray-400 text-sm">Claude is analyzing your relationship patterns...</p>
                      </div>
                    )}

                    {aiAnalysis && !analysisLoading && (
                      <div className="space-y-4 text-sm">
                        <AnalysisSection 
                          title="📈 Emotional Arc" 
                          content={aiAnalysis.emotional_arc}
                          color="emerald"
                        />
                        
                        <AnalysisSection 
                          title="💬 Communication Patterns" 
                          content={aiAnalysis.communication_patterns}
                          color="blue"
                        />
                        
                        <AnalysisSection 
                          title="🎯 Turning Points" 
                          content={aiAnalysis.turning_points}
                          color="purple"
                        />
                        
                        <AnalysisSection 
                          title="🌱 Growth Insights" 
                          content={aiAnalysis.growth_insights}
                          color="yellow"
                        />
                        
                        <AnalysisSection 
                          title="🚨 Red Flags" 
                          content={aiAnalysis.red_flags}
                          color="red"
                        />
                        
                        <AnalysisSection 
                          title="💪 Relationship Strengths" 
                          content={aiAnalysis.relationship_strengths}
                          color="amber"
                        />

                        {/* Action Items */}
                        {aiAnalysis.action_items && (
                          <div className="bg-gray-600 rounded-lg p-4 mt-4">
                            <h4 className="font-bold text-emerald-400 mb-2">💡 Action Items</h4>
                            <ul className="space-y-1">
                              {aiAnalysis.action_items.map((item, index) => (
                                <li key={index} className="text-gray-300 text-sm">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-4">
                          Analysis generated: {new Date(aiAnalysis.generated_at).toLocaleString()}
                          {aiAnalysis.cached && ' (cached)'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-3xl font-bold text-emerald-400">
              {Math.round((timelineData.filter(m => m.relationship_phase === 'Peak Connection' || m.relationship_phase === 'Romantic Phase').length / timelineData.length) * 100)}%
            </h3>
            <p className="text-gray-400">Months in Peak/Romantic Phase</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-3xl font-bold text-blue-400">
              {Math.round(timelineData.reduce((acc, m) => acc + m.messages_per_day, 0) / timelineData.length)}
            </h3>
            <p className="text-gray-400">Average Messages/Day</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-3xl font-bold text-pink-400">
              {timelineData.reduce((acc, m) => acc + m.love_expressions, 0)}
            </h3>
            <p className="text-gray-400">Total Love Expressions</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="text-3xl font-bold text-purple-400">
              {timelineData.reduce((acc, m) => acc + m.story_events, 0)}
            </h3>
            <p className="text-gray-400">Memorable Story Events</p>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          Built with Unmask Relationship Intelligence • Live data from Cloudflare D1
        </div>
      </div>
    </div>
  );
};

export default RelationshipTimeline;