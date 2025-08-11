/**
 * @file Database Schema Type Definitions
 * @description Centralized type definitions for all database tables
 * @tables conflicts, daily_tracker, journal_entries, relationship_tracker, texts-bc, relationship_scores, relationship_insights, conversation_chunks, chris_references
 */

export interface Conflict {
  id: string;
  date: string;
  description: string;
  severity: number;
  resolved: boolean;
  resolution?: string;
  participants: string[];
  created_at: string;
  updated_at: string;
}

export interface DailyTracker {
  id: string;
  date: string;
  mood_score: number;
  energy_level: number;
  stress_level: number;
  notes?: string;
  activities: string[];
  created_at: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title?: string;
  content: string;
  mood?: string;
  tags: string[];
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface RelationshipTracker {
  id: string;
  date: string;
  relationship_quality: number;
  communication_score: number;
  conflict_id?: string;
  positive_interactions: number;
  negative_interactions: number;
  notes?: string;
  created_at: string;
}

export interface TextMessage {
  id: string;
  date_time: string;
  sender: string;
  message: string;
  sentiment?: number;
  category?: string;
  tag?: string;
  emotional_tone?: string;
  created_at: string;
}

export interface RelationshipScore {
  id: string;
  date: string;
  overall_score: number;
  communication_score: number;
  emotional_connection: number;
  conflict_resolution: number;
  trust_level: number;
  conflict_count: number;
  created_at: string;
  updated_at: string;
}

export interface RelationshipInsight {
  id: string;
  date: string;
  insight_type: 'pattern' | 'recommendation' | 'warning' | 'positive';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
  related_chunks?: string[];
  action_items?: string[];
  created_at: string;
}

export interface ConversationChunk {
  id: string;
  chunk_id: string;
  start_time: string;
  end_time: string;
  participants: string[];
  message_count: number;
  summary?: string;
  emotional_tone?: string;
  conflict_detected: boolean;
  sentiment_score?: number;
  key_topics?: string[];
  created_at: string;
}

export interface ChrisReference {
  id: string;
  date: string;
  context: string;
  message_id?: string;
  chunk_id?: string;
  reference_type: 'direct' | 'indirect' | 'comparison';
  sentiment?: string;
  relevance_score?: number;
  created_at: string;
}

export interface DatabaseSchema {
  conflicts: Conflict;
  daily_tracker: DailyTracker;
  journal_entries: JournalEntry;
  relationship_tracker: RelationshipTracker;
  'texts-bc': TextMessage;
  relationship_scores: RelationshipScore;
  relationship_insights: RelationshipInsight;
  conversation_chunks: ConversationChunk;
  chris_references: ChrisReference;
}

export type TableName = keyof DatabaseSchema;

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}