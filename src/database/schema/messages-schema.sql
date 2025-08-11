CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'partner')),
  sentiment_score REAL,
  emotional_tags TEXT, -- Comma-separated tags
  conversation_id TEXT,
  thread_length INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_user_timestamp ON messages(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_sentiment ON messages(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Relationship scores table for tracking health over time
CREATE TABLE IF NOT EXISTS relationship_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  health_score REAL NOT NULL,
  calculation_method TEXT,
  timeframe_start DATETIME,
  timeframe_end DATETIME,
  metadata TEXT, -- JSON for additional metrics
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_user_date ON relationship_scores(user_id, created_at);

-- User concerns/goals table
CREATE TABLE IF NOT EXISTS user_concerns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  concern_text TEXT NOT NULL,
  concern_type TEXT, -- 'communication', 'conflict', 'intimacy', etc.
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);

-- User interactions log for coaching sessions
CREATE TABLE IF NOT EXISTS user_interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  agent_response TEXT NOT NULL,
  confidence REAL,
  feedback_rating INTEGER, -- 1-5 stars from user
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interactions_user_date ON user_interactions(user_id, created_at);

-- Processing jobs table for tracking uploads
CREATE TABLE IF NOT EXISTS processing_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  results TEXT, -- JSON results
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_status ON processing_jobs(user_id, status);