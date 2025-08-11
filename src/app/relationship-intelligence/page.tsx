// app/dashboard/page.tsx
import React from 'react';
import { Heart, TrendingUp, MessageSquare, Brain, Calendar, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Your Relationship Intelligence
        </h1>
        <p className="text-gray-600">
          Understand your patterns, resolve conflicts, and build deeper connection.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Relationship Health"
          value="8.2/10"
          change="+0.5 this week"
          trend="up"
          icon={<Heart className="w-6 h-6" />}
          color="text-pink-600"
        />
        <StatCard
          title="Messages Analyzed"
          value="2,847"
          change="Last 30 days"
          icon={<MessageSquare className="w-6 h-6" />}
          color="text-blue-600"
        />
        <StatCard
          title="Pattern Insights"
          value="12"
          change="3 new insights"
          trend="up"
          icon={<TrendingUp className="w-6 h-6" />}
          color="text-green-600"
        />
        <StatCard
          title="Coaching Sessions"
          value="8"
          change="This month"
          icon={<Brain className="w-6 h-6" />}
          color="text-purple-600"
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ActionCard
          title="Chat with Your AI Coach"
          description="Get immediate guidance, analyze patterns, or work through relationship challenges"
          href="/dashboard/chat"
          icon={<MessageSquare className="w-8 h-8" />}
          color="bg-blue-500"
        />
        <ActionCard
          title="Upload Your Messages"
          description="Import text messages to unlock deeper insights about your relationship patterns"
          href="/dashboard/upload"
          icon={<BarChart3 className="w-8 h-8" />}
          color="bg-green-500"
        />
      </div>

      {/* Recent Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentInsights />
        <RelationshipTimeline />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, trend, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? '↗' : '↘'}
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
        {change && (
          <div className="text-xs text-gray-500 mt-1">{change}</div>
        )}
      </div>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

function ActionCard({ title, description, href, icon, color }: ActionCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-xl text-white ${color} group-hover:scale-105 transition-transform`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function RecentInsights() {
  const insights = [
    {
      title: "Communication Pattern Shift",
      description: "Your response time has improved by 40% in the last two weeks",
      timestamp: "2 hours ago",
      type: "positive"
    },
    {
      title: "Conflict Resolution",
      description: "You've successfully navigated 3 potential conflicts this month",
      timestamp: "1 day ago",
      type: "positive"
    },
    {
      title: "Emotional Check",
      description: "Sentiment analysis shows increased positivity in recent conversations",
      timestamp: "3 days ago",
      type: "neutral"
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              insight.type === 'positive' ? 'bg-green-500' :
              insight.type === 'negative' ? 'bg-red-500' : 'bg-blue-500'
            }`} />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
              <p className="text-gray-600 text-sm mt-1">{insight.description}</p>
              <p className="text-gray-400 text-xs mt-1">{insight.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      <Link href="/dashboard/insights" className="block mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
        View all insights →
      </Link>
    </div>
  );
}

function RelationshipTimeline() {
  const events = [
    {
      title: "Strong Connection Phase",
      period: "Dec 2024",
      score: 9.2,
      description: "High frequency communication with positive sentiment"
    },
    {
      title: "Work Stress Period",
      period: "Nov 2024",
      score: 6.8,
      description: "Decreased interaction due to external pressures"
    },
    {
      title: "Relationship Growth",
      period: "Oct 2024",
      score: 8.5,
      description: "Improved conflict resolution and deeper conversations"
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Relationship Timeline</h3>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${
                event.score >= 8 ? 'bg-green-500' :
                event.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              {index !== events.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-200 mt-2" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                <span className="text-xs text-gray-500">{event.period}</span>
              </div>
              <p className="text-gray-600 text-sm mt-1">{event.description}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500 mr-2">Health Score:</span>
                <span className={`text-xs font-medium ${
                  event.score >= 8 ? 'text-green-600' :
                  event.score >= 6 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {event.score}/10
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link href="/dashboard/timeline" className="block mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
        View full timeline →
      </Link>
    </div>
  );
}