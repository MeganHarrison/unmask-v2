-- Create relationship_events table for tracking significant relationship milestones and events
CREATE TABLE IF NOT EXISTS relationship_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_date DATE NOT NULL,
  event_time TIME,
  event_type TEXT NOT NULL, -- 'flowers', 'said_i_love_you', 'affectionate', 'date_night', 'conflict', 'milestone', 'other'
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  
  -- Categorization
  category TEXT DEFAULT 'general', -- 'romantic', 'affection', 'conflict', 'milestone', 'communication'
  sentiment TEXT DEFAULT 'neutral', -- 'positive', 'negative', 'neutral'
  significance INTEGER DEFAULT 3 CHECK(significance >= 1 AND significance <= 5), -- 1-5 scale
  
  -- Person tracking
  initiated_by TEXT, -- 'Brandon', 'Me', 'Both', 'Other'
  
  -- Additional metadata
  location TEXT,
  mood_before TEXT,
  mood_after TEXT,
  
  -- Relationship tracking
  relationship_id INTEGER DEFAULT 1,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for common queries
  INDEX idx_event_date (event_date),
  INDEX idx_event_type (event_type),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
);

-- Create a view for easier querying with formatted dates
CREATE VIEW IF NOT EXISTS relationship_events_view AS
SELECT 
  id,
  event_date,
  event_time,
  datetime(event_date || ' ' || COALESCE(event_time, '00:00:00')) as full_datetime,
  event_type,
  title,
  description,
  notes,
  category,
  sentiment,
  significance,
  initiated_by,
  location,
  mood_before,
  mood_after,
  relationship_id,
  created_at,
  updated_at,
  -- Calculate days since event
  CAST(julianday('now') - julianday(event_date) AS INTEGER) as days_ago,
  -- Format display date
  strftime('%m/%d/%Y', event_date) as display_date
FROM relationship_events
ORDER BY event_date DESC, event_time DESC;

-- Sample event types configuration (for reference)
-- This could be stored in a separate config table if needed
/*
Event Types:
- flowers_received: "Received flowers"
- flowers_given: "Gave flowers" 
- said_i_love_you: "Said 'I love you'"
- heard_i_love_you: "Heard 'I love you'"
- physical_affection: "Physical affection (hugs, kisses, etc.)"
- quality_time: "Quality time together"
- date_night: "Date night"
- surprise_gesture: "Surprise gesture"
- thoughtful_gift: "Thoughtful gift"
- meaningful_conversation: "Meaningful conversation"
- conflict_started: "Conflict started"
- conflict_resolved: "Conflict resolved"
- milestone: "Relationship milestone"
- special_occasion: "Special occasion"
- other: "Other event"
*/