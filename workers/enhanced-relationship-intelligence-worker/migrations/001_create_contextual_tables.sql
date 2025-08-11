-- Migration: Add Contextual Intelligence Tables to megan-personal database
-- This migration adds tables needed for the enhanced relationship intelligence system

-- 1. Daily Context Table (tracks daily relationship states)
CREATE TABLE IF NOT EXISTS daily_context (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL UNIQUE,
  physical_status TEXT CHECK(physical_status IN ('together', 'apart', 'mixed')) NOT NULL,
  relationship_satisfaction INTEGER CHECK(relationship_satisfaction >= 1 AND relationship_satisfaction <= 10),
  personal_energy INTEGER CHECK(personal_energy >= 1 AND personal_energy <= 10),
  external_stressors TEXT,
  connection_quality TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Contextual Messages (links messages to daily context)
CREATE TABLE IF NOT EXISTS contextual_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  daily_context_id INTEGER NOT NULL,
  response_time_minutes REAL,
  conversation_phase TEXT CHECK(conversation_phase IN ('initiation', 'active', 'closing', 'reconnection')),
  emotional_tone TEXT,
  ai_sentiment_score REAL CHECK(ai_sentiment_score >= -1 AND ai_sentiment_score <= 1),
  ai_intensity_score REAL CHECK(ai_intensity_score >= 0 AND ai_intensity_score <= 1),
  contextual_interpretation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (daily_context_id) REFERENCES daily_context(id),
  UNIQUE(message_id)
);

-- 3. Relationship Events (significant moments)
CREATE TABLE IF NOT EXISTS relationship_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  event_type TEXT CHECK(event_type IN ('conflict', 'breakthrough', 'milestone', 'transition')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact_score INTEGER CHECK(impact_score >= -10 AND impact_score <= 10),
  resolution_status TEXT CHECK(resolution_status IN ('pending', 'in_progress', 'resolved', 'unresolved')),
  daily_context_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (daily_context_id) REFERENCES daily_context(id)
);

-- 4. Connection Metrics (AI-calculated daily health scores)
CREATE TABLE IF NOT EXISTS connection_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL UNIQUE,
  daily_context_id INTEGER NOT NULL,
  overall_health_score REAL CHECK(overall_health_score >= 0 AND overall_health_score <= 100),
  communication_score REAL CHECK(communication_score >= 0 AND communication_score <= 100),
  emotional_score REAL CHECK(emotional_score >= 0 AND emotional_score <= 100),
  presence_score REAL CHECK(presence_score >= 0 AND presence_score <= 100),
  trend_direction TEXT CHECK(trend_direction IN ('improving', 'stable', 'declining')),
  ai_insights TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (daily_context_id) REFERENCES daily_context(id)
);

-- 5. Pattern Recognition (recurring patterns detected by AI)
CREATE TABLE IF NOT EXISTS pattern_recognition (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pattern_type TEXT NOT NULL,
  pattern_name TEXT NOT NULL,
  description TEXT,
  frequency TEXT,
  trigger_conditions TEXT,
  impact_assessment TEXT,
  first_detected DATE NOT NULL,
  last_observed DATE NOT NULL,
  occurrence_count INTEGER DEFAULT 1,
  confidence_score REAL CHECK(confidence_score >= 0 AND confidence_score <= 1),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Transition Tracking (tracks connection/disconnection patterns)
CREATE TABLE IF NOT EXISTS transition_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transition_date DATE NOT NULL,
  transition_type TEXT CHECK(transition_type IN ('together_to_apart', 'apart_to_together')) NOT NULL,
  duration_days INTEGER,
  communication_pattern_change TEXT,
  emotional_impact TEXT,
  successful_reconnection BOOLEAN,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_context_date ON daily_context(date);
CREATE INDEX IF NOT EXISTS idx_contextual_messages_daily_context ON contextual_messages(daily_context_id);
CREATE INDEX IF NOT EXISTS idx_contextual_messages_message_id ON contextual_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_relationship_events_date ON relationship_events(date);
CREATE INDEX IF NOT EXISTS idx_connection_metrics_date ON connection_metrics(date);
CREATE INDEX IF NOT EXISTS idx_pattern_recognition_type ON pattern_recognition(pattern_type);
CREATE INDEX IF NOT EXISTS idx_transition_tracking_date ON transition_tracking(transition_date);

-- Add a relationship_id column to texts-bc if it doesn't exist
-- This links messages to specific relationships (for future multi-relationship support)
ALTER TABLE "texts-bc" ADD COLUMN relationship_id INTEGER DEFAULT 1;

-- Create a view for easy access to contextualized messages
CREATE VIEW IF NOT EXISTS contextualized_messages AS
SELECT 
  t.id,
  t.date_time,
  t.sender,
  t.content,
  t.media_type,
  dc.physical_status,
  dc.relationship_satisfaction,
  cm.ai_sentiment_score,
  cm.ai_intensity_score,
  cm.contextual_interpretation,
  cm.response_time_minutes
FROM "texts-bc" t
LEFT JOIN contextual_messages cm ON t.id = cm.message_id
LEFT JOIN daily_context dc ON cm.daily_context_id = dc.id
ORDER BY t.date_time DESC;