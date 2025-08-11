
// components/chat/QuickActions.tsx
import React from 'react';
import { MessageSquare, TrendingUp, Heart, Brain, Clock } from 'lucide-react';

interface QuickActionsProps {
  onActionSelect: (action: string) => void;
  variant?: 'default' | 'compact';
}

export function QuickActions({ onActionSelect, variant = 'default' }: QuickActionsProps) {
  const quickActions = [
    {
      icon: <MessageSquare className="w-4 h-4" />,
      label: 'Help with Response',
      action: "Help me respond to a message from my partner",
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Analyze Patterns',
      action: "How has our communication changed over the past few months?",
      color: 'bg-green-50 text-green-700 hover:bg-green-100'
    },
    {
      icon: <Heart className="w-4 h-4" />,
      label: 'Relationship Health',
      action: "How is our relationship doing overall?",
      color: 'bg-pink-50 text-pink-700 hover:bg-pink-100'
    },
    {
      icon: <Brain className="w-4 h-4" />,
      label: 'Understand Conflict',
      action: "Why do we keep having the same arguments?",
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Recent Insights',
      action: "Show me insights from our conversations this week",
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {quickActions.slice(0, 3).map((action, index) => (
          <button
            key={index}
            onClick={() => onActionSelect(action.action)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${action.color}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {quickActions.map((action, index) => (
        <button
          key={index}
          onClick={() => onActionSelect(action.action)}
          className={`p-4 rounded-xl border border-gray-200 text-left transition-all hover:shadow-md ${action.color}`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {action.icon}
            </div>
            <div>
              <div className="font-medium text-sm">{action.label}</div>
              <div className="text-xs opacity-75 mt-1">
                {action.action.length > 40 
                  ? action.action.substring(0, 40) + '...' 
                  : action.action
                }
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}