-- Monthly Relationship Timeline with Comprehensive Data Aggregation
-- This creates the foundation for your clickable monthly connection chart

WITH monthly_message_stats AS (
  SELECT 
    -- Parse the M/D/YY date format properly
    CASE 
      WHEN date LIKE '%/%/23' THEN '2023-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
      WHEN date LIKE '%/%/24' THEN '2024-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
      WHEN date LIKE '%/%/25' THEN '2025-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
      WHEN date LIKE '%/%/22' THEN '2022-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
    END as month,
    
    COUNT(*) as message_count,
    COUNT(CASE WHEN sender = 'Brandon' THEN 1 END) as brandon_messages,
    COUNT(CASE WHEN sender != 'Brandon' THEN 1 END) as user_messages,
    AVG(CASE WHEN sentiment_score IS NOT NULL THEN sentiment_score END) as avg_sentiment,
    AVG(CASE WHEN emotional_score IS NOT NULL THEN emotional_score END) as avg_emotional_score,
    COUNT(CASE WHEN conflict_detected = 1 THEN 1 END) as conflict_count,
    
    -- Communication frequency patterns
    COUNT(DISTINCT date) as days_with_messages,
    CAST(COUNT(*) AS FLOAT) / COUNT(DISTINCT date) as messages_per_day,
    
    -- Emotional intensity metrics
    COUNT(CASE WHEN emotional_score >= 8 THEN 1 END) as high_emotion_messages,
    COUNT(CASE WHEN emotional_score <= 3 THEN 1 END) as low_emotion_messages,
    
    -- Content analysis
    AVG(LENGTH(message)) as avg_message_length,
    COUNT(CASE WHEN LOWER(message) LIKE '%love%' OR message LIKE '%❤%' OR message LIKE '%💕%' OR message LIKE '%🥰%' OR message LIKE '%😘%' THEN 1 END) as love_expressions,
    COUNT(CASE WHEN category = 'supportive' THEN 1 END) as supportive_messages,
    COUNT(CASE WHEN category = 'conflict' THEN 1 END) as conflict_messages,
    
    -- Communication balance
    ROUND(CAST(COUNT(CASE WHEN sender = 'Brandon' THEN 1 END) AS FLOAT) / COUNT(*), 3) as brandon_message_ratio
    
  FROM `texts-bc` 
  WHERE date IS NOT NULL AND date != ''
  GROUP BY month
),

monthly_daily_tracker AS (
  SELECT 
    strftime('%Y-%m', date) as month,
    AVG(connection_score) as avg_daily_connection,
    AVG(mood_user) as avg_user_mood,
    AVG(mood_partner) as avg_partner_mood,
    AVG(time_together_hours) as avg_time_together,
    COUNT(CASE WHEN physical_intimacy = 1 THEN 1 END) as intimacy_days,
    COUNT(CASE WHEN conflict_occurred = 1 THEN 1 END) as conflict_days,
    AVG(CASE WHEN conflict_intensity IS NOT NULL THEN conflict_intensity END) as avg_conflict_intensity,
    COUNT(*) as tracked_days
  FROM daily_tracker 
  WHERE date IS NOT NULL
  GROUP BY strftime('%Y-%m', date)
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
    AVG(CAST(rating AS FLOAT)) as avg_story_rating,
    GROUP_CONCAT(name, ' | ') as story_events_list
  FROM our_story 
  WHERE story_year IS NOT NULL AND story_month IS NOT NULL
  GROUP BY story_year, story_month
),

monthly_journal AS (
  SELECT 
    strftime('%Y-%m', date) as month,
    COUNT(*) as journal_entries,
    GROUP_CONCAT(substr(content, 1, 100), '... | ') as journal_snippets
  FROM journal_entries 
  WHERE date IS NOT NULL
  GROUP BY strftime('%Y-%m', date)
)

-- Final aggregated monthly timeline
SELECT 
  m.month,
  
  -- Core connection metrics
  COALESCE(cl.connection_score, 
    CASE 
      WHEN m.avg_sentiment >= 0.7 AND m.messages_per_day >= 15 THEN 9
      WHEN m.avg_sentiment >= 0.6 AND m.messages_per_day >= 12 THEN 8
      WHEN m.avg_sentiment >= 0.5 AND m.messages_per_day >= 10 THEN 7
      WHEN m.avg_sentiment >= 0.4 AND m.messages_per_day >= 8 THEN 6
      WHEN m.avg_sentiment >= 0.3 AND m.messages_per_day >= 5 THEN 5
      WHEN m.messages_per_day >= 3 THEN 4
      ELSE 3
    END
  ) as connection_level,
  
  -- Message volume and patterns
  m.message_count,
  m.brandon_messages,
  m.user_messages,
  ROUND(m.messages_per_day, 1) as messages_per_day,
  m.days_with_messages,
  m.brandon_message_ratio,
  
  -- Emotional indicators
  ROUND(COALESCE(m.avg_sentiment, 0), 3) as avg_sentiment,
  ROUND(COALESCE(m.avg_emotional_score, 5), 1) as avg_emotional_score,
  m.high_emotion_messages,
  m.low_emotion_messages,
  
  -- Relationship health signals
  m.love_expressions,
  m.supportive_messages,
  m.conflict_count as message_conflicts,
  ROUND(m.avg_message_length, 0) as avg_message_length,
  
  -- Daily tracker insights
  ROUND(COALESCE(dt.avg_daily_connection, 0), 1) as avg_daily_connection,
  ROUND(COALESCE(dt.avg_user_mood, 0), 1) as avg_user_mood,
  ROUND(COALESCE(dt.avg_partner_mood, 0), 1) as avg_partner_mood,
  ROUND(COALESCE(dt.avg_time_together, 0), 1) as avg_time_together,
  COALESCE(dt.intimacy_days, 0) as intimacy_days,
  COALESCE(dt.conflict_days, 0) as tracked_conflict_days,
  
  -- Story events and reflections
  COALESCE(se.story_event_count, 0) as story_events,
  ROUND(COALESCE(se.avg_story_rating, 0), 1) as avg_story_rating,
  COALESCE(j.journal_entries, 0) as journal_entries,
  
  -- Calculated relationship phase
  CASE 
    WHEN m.messages_per_day >= 15 AND m.love_expressions >= 15 THEN 'Peak Connection'
    WHEN m.conflict_count >= 10 OR COALESCE(dt.conflict_days, 0) >= 5 THEN 'Tension Period'
    WHEN m.messages_per_day <= 5 THEN 'Distance Phase'
    WHEN m.supportive_messages >= m.message_count * 0.2 THEN 'Supportive Period'
    WHEN m.love_expressions >= 10 THEN 'Romantic Phase'
    ELSE 'Steady State'
  END as relationship_phase,
  
  -- Meta information for drill-down
  se.story_events_list,
  j.journal_snippets
  
FROM monthly_message_stats m
LEFT JOIN connection_levels cl ON strftime('%Y-%m', cl.month) = m.month
LEFT JOIN monthly_daily_tracker dt ON dt.month = m.month  
LEFT JOIN monthly_story_events se ON se.month = m.month
LEFT JOIN monthly_journal j ON j.month = m.month

WHERE m.month IS NOT NULL
ORDER BY m.month;