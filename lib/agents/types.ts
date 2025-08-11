// lib/agents/types.ts
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentType?: string;
  confidence?: number;
  metadata?: {
    intent?: string;
    supportingData?: any[];
    nextSteps?: string[];
    relatedInsights?: string[];
  };
}

export interface AgentCapabilities {
  name: string;
  description: string;
  specialties: string[];
  confidence_threshold: number;
  max_context_length: number;
}

export const AGENT_REGISTRY: Record<string, AgentCapabilities> = {
  'coaching-agent': {
    name: 'Relationship Coach',
    description: 'Provides strategic relationship guidance and actionable advice',
    specialties: ['immediate_guidance', 'communication_coaching', 'strategic_planning'],
    confidence_threshold: 0.7,
    max_context_length: 4000,
  },
  'pattern-agent': {
    name: 'Pattern Analyst',
    description: 'Identifies trends and patterns in relationship dynamics',
    specialties: ['trend_analysis', 'communication_evolution', 'behavioral_patterns'],
    confidence_threshold: 0.8,
    max_context_length: 8000,
  },
  'conflict-agent': {
    name: 'Conflict Specialist',
    description: 'Analyzes and provides resolution strategies for relationship conflicts',
    specialties: ['conflict_analysis', 'escalation_detection', 'resolution_strategies'],
    confidence_threshold: 0.85,
    max_context_length: 6000,
  },
  'emotional-agent': {
    name: 'Emotional Intelligence Specialist',
    description: 'Tracks emotional health and provides attachment-focused insights',
    specialties: ['sentiment_analysis', 'attachment_coaching', 'emotional_health'],
    confidence_threshold: 0.75,
    max_context_length: 5000,
  },
  'memory-agent': {
    name: 'Relationship Historian',
    description: 'Retrieves and contextualizes relationship history and data',
    specialties: ['data_retrieval', 'historical_context', 'timeline_analysis'],
    confidence_threshold: 0.9,
    max_context_length: 10000,
  },
};