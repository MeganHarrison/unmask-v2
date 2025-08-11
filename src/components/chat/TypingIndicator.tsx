// components/chat/TypingIndicator.tsx
import React from 'react';
import { Brain, Heart, TrendingUp, MessageSquare } from 'lucide-react';

interface TypingIndicatorProps {
  agentType?: string | null;
}

export function TypingIndicator({ agentType }: TypingIndicatorProps) {
  const agentName = getAgentName(agentType);
  const agentIcon = getAgentIcon(agentType);

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          {agentIcon}
        </div>
        <div className="bg-gray-100 rounded-2xl px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{agentName} is thinking</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAgentName(agentType?: string | null): string {
  switch (agentType) {
    case 'coaching-agent':
      return 'Relationship Coach';
    case 'pattern-agent':
      return 'Pattern Analyst';
    case 'conflict-agent':
      return 'Conflict Specialist';
    case 'emotional-agent':
      return 'Emotional Intelligence';
    case 'memory-agent':
      return 'Memory Specialist';
    default:
      return 'AI Coach';
  }
}

function getAgentIcon(agentType?: string | null) {
  const iconClass = "w-4 h-4 text-gray-600";
  
  switch (agentType) {
    case 'coaching-agent':
      return <Heart className={iconClass} />;
    case 'pattern-agent':
      return <TrendingUp className={iconClass} />;
    case 'conflict-agent':
      return <MessageSquare className={iconClass} />;
    case 'emotional-agent':
      return <Heart className={iconClass} />;
    case 'memory-agent':
      return <Brain className={iconClass} />;
    default:
      return <Brain className={iconClass} />;
  }
}