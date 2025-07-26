'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';

const RelationshipDashboard = () => {
  const [relationshipData, setRelationshipData] = useState<any[]>([]);
  const [textData, setTextData] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d');

  // Mock data for demonstration - replace with your Hyperdrive API calls
  useEffect(() => {
    const mockRelationshipData = [
      { id: 1, name: "Sarah Johnson", type: "Business", health_score: 85, last_contact: "2025-07-20", relationship_strength: 8 },
      { id: 2, name: "Mike Chen", type: "Friend", health_score: 92, last_contact: "2025-07-22", relationship_strength: 9 },
      { id: 3, name: "Lisa Rodriguez", type: "Family", health_score: 78, last_contact: "2025-07-18", relationship_strength: 7 },
      { id: 4, name: "David Kim", type: "Business", health_score: 65, last_contact: "2025-07-15", relationship_strength: 6 },
      { id: 5, name: "Emma Wilson", type: "Friend", health_score: 88, last_contact: "2025-07-23", relationship_strength: 8 }
    ];

    const mockTextData = [
      { date: "2025-07-01", message_count: 15, avg_response_time: 2.3 },
      { date: "2025-07-02", message_count: 22, avg_response_time: 1.8 },
      { date: "2025-07-03", message_count: 18, avg_response_time: 3.1 },
      { date: "2025-07-04", message_count: 8, avg_response_time: 4.2 },
      { date: "2025-07-05", message_count: 25, avg_response_time: 1.5 },
      { date: "2025-07-06", message_count: 20, avg_response_time: 2.7 },
      { date: "2025-07-07", message_count: 12, avg_response_time: 3.8 }
    ];

    const mockInsights = {
      totalRelationships: 127,
      activeThisWeek: 45,
      averageHealthScore: 82,
      responsiveContacts: 89,
      communicationTrend: "+15%"
    };

    setRelationshipData(mockRelationshipData);
    setTextData(mockTextData);
    setInsights(mockInsights);
    setLoading(false);
  }, [timeFilter]);

  // Real implementation would use your Hyperdrive connection
  const fetchDashboardData = async () => {
    // Replace with your actual API endpoints
    /*
    const [relationships, texts] = await Promise.all([
      fetch('/api/relationship-metrics'),
      fetch('/api/text-analytics')
    ]);
    */
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  const relationshipTypeData = relationshipData.reduce((acc, rel) => {
    acc[rel.type] = (acc[rel.type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(relationshipTypeData).map(([type, count]) => ({
    name: type,
    value: count
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Relationship Intelligence Hub</h1>
          <p className="text-gray-600">Real-time insights into your relationship network and communication patterns</p>
          
          {/* Time Filter */}
          <div className="mt-4">
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total Relationships</h3>
            <p className="text-2xl font-bold text-gray-900">{insights.totalRelationships}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Active This Week</h3>
            <p className="text-2xl font-bold text-green-600">{insights.activeThisWeek}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Avg Health Score</h3>
            <p className="text-2xl font-bold text-blue-600">{insights.averageHealthScore}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Responsive Contacts</h3>
            <p className="text-2xl font-bold text-purple-600">{insights.responsiveContacts}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Communication Trend</h3>
            <p className="text-2xl font-bold text-green-500">{insights.communicationTrend}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Communication Frequency */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Communication Frequency</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={textData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === 'message_count' ? 'Messages' : 'Avg Response (hrs)']} />
                <Line type="monotone" dataKey="message_count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Relationship Types */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Relationship Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Response Time Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Response Time Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={textData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} hours`, 'Avg Response Time']} />
                <Bar dataKey="avg_response_time" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Relationship Health vs Engagement */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Health Score vs Engagement</h3>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart data={relationshipData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="health_score" name="Health Score" />
                <YAxis dataKey="relationship_strength" name="Strength" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter dataKey="relationship_strength" fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Relationship Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Relationship Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Strength</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {relationshipData.map((relationship) => (
                  <tr key={relationship.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {relationship.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        relationship.type === 'Business' ? 'bg-blue-100 text-blue-800' :
                        relationship.type === 'Friend' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {relationship.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${relationship.health_score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{relationship.health_score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {relationship.last_contact}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full mr-1 ${
                              i < relationship.relationship_strength ? 'bg-yellow-400' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        relationship.health_score >= 80 ? 'bg-green-100 text-green-800' :
                        relationship.health_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {relationship.health_score >= 80 ? 'Strong' :
                         relationship.health_score >= 60 ? 'Moderate' : 'Needs Attention'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationshipDashboard;