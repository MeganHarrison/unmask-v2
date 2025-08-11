export interface BaseMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'partner';
  sentimentScore?: number;
  emotionalTags?: string[];
}

export interface RelationshipMetrics {
  healthScore: number;
  communicationFrequency: number;
  sentimentTrend: 'improving' | 'declining' | 'stable';
  conflictFrequency: number;
  intimacyLevel: number;
  lastUpdated: string;
}

export interface ConflictEvent {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  trigger: string;
  severity: 1 | 2 | 3 | 4 | 5;
  resolution?: 'resolved' | 'unresolved' | 'ongoing';
  messages: BaseMessage[];
  insights?: string[];
}

export interface CoachingSession {
  id: string;
  userId: string;
  timestamp: string;
  userQuery: string;
  agentResponse: string;
  agentType: string;
  confidence: number;
  followUpActions?: string[];
  effectiveness?: number; // 1-5 rating from user
}