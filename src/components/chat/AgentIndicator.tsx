// components/chat/AgentIndicator.tsx
import React from 'react';
import { Brain, Heart, TrendingUp, MessageSquare, Shield } from 'lucide-react';

interface AgentIndicatorProps {
  agentType: string;
  className?: string;
}

export function AgentIndicator({ agentType, className = '' }: AgentIndicatorProps) {
  const agent = getAgentInfo(agentType);

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg ${className}`}>
      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
        {agent.icon}
      </div>
      <div>
        <div className="text-sm font-medium text-blue-900">{agent.name}</div>
        <div className="text-xs text-blue-600">{agent.description}</div>
      </div>
    </div>
  );
}

function getAgentInfo(agentType: string) {
  const iconClass = "w-3 h-3 text-blue-600";
  
  switch (agentType) {
    case 'coaching-agent':
      return {
        name: 'Relationship Coach',
        description: 'Strategic guidance & advice',
        icon: <Heart className={iconClass} />
      };
    case 'pattern-agent':
      return {
        name: 'Pattern Analyst',
        description: 'Trend & behavior analysis',
        icon: <TrendingUp className={iconClass} />
      };
    case 'conflict-agent':
      return {
        name: 'Conflict Specialist',
        description: 'Resolution strategies',
        icon: <Shield className={iconClass} />
      };
    case 'emotional-agent':
      return {
        name: 'Emotional Intelligence',
        description: 'Sentiment & attachment insights',
        icon: <Heart className={iconClass} />
      };
    case 'memory-agent':
      return {
        name: 'Memory Specialist',
        description: 'Historical context & data',
        icon: <Brain className={iconClass} />
      };
    default:
      return {
        name: 'AI Coach',
        description: 'Relationship intelligence',
        icon: <Brain className={iconClass} />
      };
  }
}