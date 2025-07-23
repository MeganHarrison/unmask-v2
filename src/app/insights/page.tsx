'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageFrequencyChart } from '@/components/charts/MessageFrequencyChart';
import { SentimentChart } from '@/components/charts/SentimentChart';
import { TrendingUp, TrendingDown, Users, AlertCircle, Calendar, Zap, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyzeButton } from '@/components/ui/AnalyzeButton';

interface MessageStats {
  total: number;
  bySender: { sender: string; count: number }[];
  byDate: { date: string; count: number }[];
  byMonth: { month: string; count: number }[];
  sentimentOverview: {
    positive: number;
    negative: number;
    neutral: number;
    unanalyzed: number;
  };
  conflictCount: number;
  averageMessagesPerDay: number;
  longestStreak: number;
  currentStreak: number;
}

export default function InsightsPage() {
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/insights/generate');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json() as MessageStats;
      setStats(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
      // Set mock data for now to prevent crash
      setStats({
        total: 0,
        bySender: [],
        byDate: [],
        byMonth: [],
        sentimentOverview: {
          positive: 0,
          negative: 0,
          neutral: 0,
          unanalyzed: 0
        },
        conflictCount: 0,
        averageMessagesPerDay: 0,
        longestStreak: 0,
        currentStreak: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMessageBalance = () => {
    if (!stats || stats.bySender.length < 2) return 50;
    const total = stats.bySender.reduce((sum, s) => sum + s.count, 0);
    return Math.round((stats.bySender[0].count / total) * 100);
  };

  const getSentimentPercentage = (type: keyof MessageStats['sentimentOverview']) => {
    if (!stats) return 0;
    const total = stats.sentimentOverview.positive + 
                  stats.sentimentOverview.negative + 
                  stats.sentimentOverview.neutral;
    if (total === 0) return 0;
    return Math.round((stats.sentimentOverview[type] / total) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Relationship Insights</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-24" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Relationship Insights</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">Failed to load insights</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Relationship Insights</h1>
        <p className="text-gray-600">Analyze your communication patterns and relationship health</p>
        <div className="mt-4">
          <AnalyzeButton />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg {stats.averageMessagesPerDay}/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Message Balance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateMessageBalance()}%</div>
            <div className="text-xs text-muted-foreground">
              {stats.bySender.map(s => `${s.sender}: ${s.count}`).join(' | ')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Longest: {stats.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts Detected</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conflictCount}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.conflictCount / stats.total) * 100).toFixed(1)}% of messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Message Frequency</CardTitle>
            <CardDescription>Daily message count over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <MessageFrequencyChart data={stats.byDate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
            <CardDescription>Emotional tone distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <SentimentChart data={stats.sentimentOverview} />
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Communication Trends</CardTitle>
          <CardDescription>Message volume by month</CardDescription>
        </CardHeader>
        <CardContent>
          <MessageFrequencyChart 
            data={stats.byMonth.map(item => ({
              date: item.month,
              count: item.count
            }))} 
            isMonthly
          />
        </CardContent>
      </Card>

      {/* Sentiment Breakdown */}
      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">Positive Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {getSentimentPercentage('positive')}%
            </div>
            <p className="text-sm text-green-600">
              {stats.sentimentOverview.positive} messages
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-700">Neutral Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">
              {getSentimentPercentage('neutral')}%
            </div>
            <p className="text-sm text-yellow-600">
              {stats.sentimentOverview.neutral} messages
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Negative Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">
              {getSentimentPercentage('negative')}%
            </div>
            <p className="text-sm text-red-600">
              {stats.sentimentOverview.negative} messages
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}