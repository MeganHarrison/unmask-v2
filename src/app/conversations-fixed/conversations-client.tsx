'use client';

import { useState, useMemo } from 'react';
import { 
  CalendarIcon, 
  ChartBarIcon, 
  TagIcon, 
  FunnelIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  SparklesIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface ConversationChunk {
  id: number;
  start_time: string;
  end_time: string;
  message_count: number;
  chunk_summary: string;
  emotional_tone: string;
  conflict_detected: boolean;
  sentiment_score: number;
  tags_json?: string;
}

interface ConversationStats {
  totalConversations: number;
  averageSentiment: number;
  conflictRate: number;
  emotionalBreakdown: Record<string, number>;
  topicsDiscussed: Array<{ topic: string; count: number }>;
  communicationPatterns: {
    averageMessagesPerConversation: number;
    averageConversationDuration: number;
    peakHours: Array<{ hour: number; count: number }>;
  };
}

interface FilterOptions {
  dateRange: { start: string; end: string };
  emotionalTone: string;
  conflictOnly: boolean;
  searchQuery: string;
  selectedTags: string[];
}

interface Props {
  initialConversations: ConversationChunk[];
  initialStats: ConversationStats;
}

const EMOTION_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
  mixed: '#f59e0b'
};

export default function ConversationsClient({ initialConversations, initialStats }: Props) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>(['important', 'milestone', 'resolved', 'recurring', 'emotional']);
  
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '', end: '' },
    emotionalTone: 'all',
    conflictOnly: false,
    searchQuery: '',
    selectedTags: []
  });

  // Calculate dynamic stats based on filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      if (filters.conflictOnly && !conv.conflict_detected) return false;
      if (filters.emotionalTone !== 'all' && conv.emotional_tone !== filters.emotionalTone) return false;
      if (filters.searchQuery && !conv.chunk_summary?.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      if (filters.dateRange.start && new Date(conv.start_time) < new Date(filters.dateRange.start)) return false;
      if (filters.dateRange.end && new Date(conv.end_time) > new Date(filters.dateRange.end)) return false;
      
      // Tag filtering
      if (filters.selectedTags.length > 0) {
        const convTags = conv.tags_json ? JSON.parse(conv.tags_json) : [];
        if (!filters.selectedTags.some(tag => convTags.includes(tag))) return false;
      }
      
      return true;
    });
  }, [conversations, filters]);

  // Prepare chart data
  const sentimentTrendData = useMemo(() => {
    const grouped = filteredConversations.reduce((acc, conv) => {
      const date = new Date(conv.start_time).toLocaleDateString();
      if (!acc[date]) acc[date] = { date, avgSentiment: 0, count: 0 };
      acc[date].avgSentiment += conv.sentiment_score;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      date: item.date,
      sentiment: (item.avgSentiment / item.count).toFixed(1)
    })).slice(-30); // Last 30 days
  }, [filteredConversations]);

  const emotionPieData = useMemo(() => {
    const breakdown = initialStats.emotionalBreakdown;
    return Object.entries(breakdown).map(([emotion, count]) => ({
      name: emotion,
      value: count,
      color: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || '#6b7280'
    }));
  }, [initialStats]);

  const communicationRadarData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayActivity = days.map(day => {
      const count = filteredConversations.filter(conv => 
        days[new Date(conv.start_time).getDay()] === day
      ).length;
      return { day, conversations: count };
    });
    return dayActivity;
  }, [filteredConversations]);

  const handleAddTag = (conversationId: number, tag: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const currentTags = conv.tags_json ? JSON.parse(conv.tags_json) : [];
        if (!currentTags.includes(tag)) {
          currentTags.push(tag);
          return { ...conv, tags_json: JSON.stringify(currentTags) };
        }
      }
      return conv;
    }));
  };

  const handleRemoveTag = (conversationId: number, tag: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const currentTags = conv.tags_json ? JSON.parse(conv.tags_json) : [];
        const updatedTags = currentTags.filter((t: string) => t !== tag);
        return { ...conv, tags_json: JSON.stringify(updatedTags) };
      }
      return conv;
    }));
  };

  const handleCreateTag = () => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags([...availableTags, newTag]);
      setNewTag('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Relationship Intelligence Dashboard</h1>
              <p className="text-gray-600 mt-1">Deep insights into your communication patterns and emotional dynamics</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FunnelIcon className="h-5 w-5" />
                <span>Filters</span>
              </button>
              <button
                onClick={() => setShowTagManager(!showTagManager)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <TagIcon className="h-5 w-5" />
                <span>Tags</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value }}))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value }}))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emotional Tone</label>
                <select
                  value={filters.emotionalTone}
                  onChange={(e) => setFilters(prev => ({ ...prev, emotionalTone: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Emotions</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="neutral">Neutral</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.conflictOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, conflictOnly: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Conflicts Only</span>
                </label>
              </div>
            </div>

            {/* Tag Filter */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const isSelected = filters.selectedTags.includes(tag);
                      setFilters(prev => ({
                        ...prev,
                        selectedTags: isSelected 
                          ? prev.selectedTags.filter(t => t !== tag)
                          : [...prev.selectedTags, tag]
                      }));
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      filters.selectedTags.includes(tag)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag Manager */}
      {showTagManager && (
        <div className="bg-purple-50 border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Create new tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                onClick={handleCreateTag}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Create Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{filteredConversations.length}</p>
              </div>
              <ChatBubbleLeftRightIcon className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Sentiment</p>
                <p className="text-2xl font-bold text-gray-900">{initialStats.averageSentiment.toFixed(1)}/10</p>
              </div>
              <HeartIcon className="h-10 w-10 text-pink-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conflict Rate</p>
                <p className="text-2xl font-bold text-gray-900">{(initialStats.conflictRate * 100).toFixed(0)}%</p>
              </div>
              <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Messages/Conv</p>
                <p className="text-2xl font-bold text-gray-900">
                  {initialStats.communicationPatterns.averageMessagesPerConversation.toFixed(0)}
                </p>
              </div>
              <SparklesIcon className="h-10 w-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sentiment Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Sentiment Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sentimentTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="sentiment" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Emotional Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Emotional Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={emotionPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {emotionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Communication Patterns */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Communication Pattern</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={communicationRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="day" />
                <PolarRadiusAxis />
                <Radar name="Conversations" dataKey="conversations" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Peak Hours */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Peak Communication Hours</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={initialStats.communicationPatterns.peakHours.slice(0, 24)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Conversation Timeline</h3>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredConversations.length} of {conversations.length} conversations
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredConversations.map((conversation) => {
              const tags = conversation.tags_json ? JSON.parse(conversation.tags_json) : [];
              
              return (
                <div 
                  key={conversation.id}
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition ${
                    selectedConversation === conversation.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedConversation(
                    selectedConversation === conversation.id ? null : conversation.id
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          conversation.emotional_tone === 'positive' ? 'bg-green-100 text-green-800' :
                          conversation.emotional_tone === 'negative' ? 'bg-red-100 text-red-800' :
                          conversation.emotional_tone === 'mixed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {conversation.emotional_tone}
                        </span>
                        
                        {conversation.conflict_detected && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            Conflict
                          </span>
                        )}

                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{new Date(conversation.start_time).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4" />
                          <span>{conversation.message_count} messages</span>
                        </div>
                      </div>

                      <p className="text-gray-800 mb-2">
                        {conversation.chunk_summary || 'No summary available'}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 items-center">
                        {tags.map((tag: string) => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        
                        {selectedConversation === conversation.id && (
                          <div className="flex items-center space-x-2">
                            <select
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAddTag(conversation.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="text-xs px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="">Add tag...</option>
                              {availableTags.filter(tag => !tags.includes(tag)).map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {conversation.sentiment_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">Sentiment</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}