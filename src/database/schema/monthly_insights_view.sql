-- Create a materialized view for fast monthly dashboard loading
CREATE VIEW IF NOT EXISTS monthly_relationship_insights AS
WITH monthly_message_stats AS (
  SELECT 
    CASE 
      WHEN date LIKE '%/%/23' THEN '2023-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
      WHEN date LIKE '%/%/24' THEN '2024-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
      WHEN date LIKE '%/%/25' THEN '2025-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
      WHEN date LIKE '%/%/22' THEN '2022-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
    END as month,
    
    COUNT(*) as message_count,
    COUNT(CASE WHEN sender = 'Brandon' THEN 1 END) as brandon_messages,
    COUNT(CASE WHEN sender != 'Brandon' THEN 1 END) as user_messages,
    CAST(COUNT(*) AS FLOAT) / COUNT(DISTINCT date) as messages_per_day,
    COUNT(CASE WHEN LOWER(message) LIKE '%love%' OR message LIKE '%❤%' OR message LIKE '%💕%' THEN 1 END) as love_expressions,
    AVG(CASE WHEN sentiment_score IS NOT NULL THEN sentiment_score END) as avg_sentiment,
    COUNT(CASE WHEN conflict_detected = 1 THEN 1 END) as conflict_count,
    AVG(LENGTH(message)) as avg_message_length,
    ROUND(CAST(COUNT(CASE WHEN sender = 'Brandon' THEN 1 END) AS FLOAT) / COUNT(*), 3) as brandon_message_ratio
    
  FROM `texts-bc` 
  WHERE date IS NOT NULL AND date != ''
  GROUP BY month
),

monthly_story_events AS (
  SELECT 
    story_year || '-' || printf('%02d', 
      CASE story_month
        WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3 WHEN 'April' THEN 4
        WHEN 'May' THEN 5 WHEN 'June' THEN 6 WHEN 'July' THEN 7 WHEN 'August' THEN 8
        WHEN 'September' THEN 9 WHEN 'October' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12
        ELSE 1
      END
    ) as month,
    COUNT(*) as story_event_count,
    GROUP_CONCAT(name, ' | ') as story_events_list
  FROM our_story 
  WHERE story_year IS NOT NULL AND story_month IS NOT NULL
  GROUP BY story_year, story_month
)

SELECT 
  m.month,
  
  -- Core metrics for dashboard
  CASE 
    WHEN m.avg_sentiment >= 0.7 AND m.messages_per_day >= 15 THEN 9
    WHEN m.avg_sentiment >= 0.6 AND m.messages_per_day >= 12 THEN 8
    WHEN m.avg_sentiment >= 0.5 AND m.messages_per_day >= 10 THEN 7
    WHEN m.avg_sentiment >= 0.4 AND m.messages_per_day >= 8 THEN 6
    WHEN m.avg_sentiment >= 0.3 AND m.messages_per_day >= 5 THEN 5
    WHEN m.messages_per_day >= 3 THEN 4
    ELSE 3
  END as connection_level,
  
  m.message_count,
  ROUND(m.messages_per_day, 1) as messages_per_day,
  m.love_expressions,
  m.brandon_message_ratio,
  m.conflict_count,
  ROUND(m.avg_message_length, 0) as avg_message_length,
  
  -- Story events
  COALESCE(se.story_event_count, 0) as story_events,
  se.story_events_list,
  
  -- Calculated relationship phase
  CASE 
    WHEN m.messages_per_day >= 15 AND m.love_expressions >= 15 THEN 'Peak Connection'
    WHEN m.conflict_count >= 10 THEN 'Tension Period'
    WHEN m.messages_per_day <= 5 THEN 'Distance Phase'
    WHEN m.love_expressions >= 10 THEN 'Romantic Phase'
    ELSE 'Steady State'
  END as relationship_phase,
  
  -- For AI analysis context
  json_object(
    'message_volume', m.message_count,
    'daily_frequency', m.messages_per_day,
    'emotional_expression', m.love_expressions,
    'communication_balance', m.brandon_message_ratio,
    'conflict_level', m.conflict_count,
    'major_events', COALESCE(se.story_event_count, 0),
    'avg_message_depth', m.avg_message_length
  ) as ai_context_json
  
FROM monthly_message_stats m
LEFT JOIN monthly_story_events se ON se.month = m.month
WHERE m.month IS NOT NULL
ORDER BY m.month;

-- Create index for fast dashboard queries
CREATE INDEX IF NOT EXISTS idx_monthly_insights_month ON monthly_relationship_insights(month);

-- AI Analysis Prompt Template Table
CREATE TABLE IF NOT EXISTS ai_analysis_prompts (
  id INTEGER PRIMARY KEY,
  analysis_type TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert AI analysis prompt templates
INSERT OR REPLACE INTO ai_analysis_prompts (id, analysis_type, prompt_template) VALUES 
(1, 'monthly_overview', 
'Analyze this relationship month based on the following data:

Month: {month}
Messages: {message_count} total ({messages_per_day}/day)
Love expressions: {love_expressions}
Communication balance: {brandon_ratio}% Brandon, {user_ratio}% User
Conflicts detected: {conflict_count}
Major events: {story_events_list}
Relationship phase: {relationship_phase}

Provide a brutally honest analysis covering:
1. Emotional Arc: What was the emotional journey this month?
2. Communication Patterns: What do the message patterns reveal?
3. Turning Points: Any significant moments or shifts?
4. Growth Insights: What strengths/weaknesses emerged?
5. Red Flags: Any concerning patterns?
6. Relationship Strengths: What worked well?

Be specific, data-driven, and focus on actionable insights.'),

(2, 'trend_analysis',
'Compare these consecutive months and identify patterns:

Previous Month: {prev_month_data}
Current Month: {current_month_data}
Next Month: {next_month_data}

Focus on:
- Communication frequency changes
- Emotional expression trends
- Event correlation with message patterns
- Early warning signs or positive momentum
- Relationship trajectory insights'),

(3, 'conflict_deep_dive',
'Analyze this high-conflict period:

Month: {month}
Conflict indicators: {conflict_count}
Message volume: {message_count}
Events during period: {story_events_list}

Examine:
- Conflict triggers and resolution patterns
- How communication changed during/after conflicts
- Relationship resilience indicators
- Recovery strategies that worked
- Prevention recommendations');

-- Monthly Analysis Cache Table (for performance)
CREATE TABLE IF NOT EXISTS monthly_analysis_cache (
  id INTEGER PRIMARY KEY,
  month TEXT NOT NULL UNIQUE,
  ai_analysis_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update cache timestamp
CREATE TRIGGER IF NOT EXISTS update_analysis_cache_timestamp 
AFTER UPDATE ON monthly_analysis_cache
BEGIN
  UPDATE monthly_analysis_cache 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;