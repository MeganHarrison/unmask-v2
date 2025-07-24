-- Monthly Drill-Down Query: Get ALL details for a specific month
-- Replace @selected_month with the actual month (e.g., '2024-08')
-- This powers the clickable monthly deep-dive functionality

WITH monthly_messages AS (
  SELECT 
    date,
    time,
    sender,
    message,
    sentiment_score,
    emotional_score,
    category,
    tag,
    conflict_detected,
    LENGTH(message) as message_length
  FROM `texts-bc`
  WHERE CASE 
    WHEN date LIKE '%/%/23' THEN '2023-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
    WHEN date LIKE '%/%/24' THEN '2024-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
    WHEN date LIKE '%/%/25' THEN '2025-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
    WHEN date LIKE '%/%/22' THEN '2022-' || printf('%02d', CAST(SUBSTR(date, 1, INSTR(date, '/') - 1) AS INTEGER))
  END = @selected_month
  ORDER BY date, time
),

daily_summaries AS (
  SELECT 
    date,
    COUNT(*) as daily_message_count,
    COUNT(CASE WHEN sender = 'Brandon' THEN 1 END) as brandon_daily_messages,
    COUNT(CASE WHEN sender != 'Brandon' THEN 1 END) as user_daily_messages,
    AVG(CASE WHEN sentiment_score IS NOT NULL THEN sentiment_score END) as daily_avg_sentiment,
    COUNT(CASE WHEN conflict_detected = 1 THEN 1 END) as daily_conflicts,
    COUNT(CASE WHEN LOWER(message) LIKE '%love%' OR message LIKE '%❤%' OR message LIKE '%💕%' THEN 1 END) as daily_love_expressions,
    AVG(message_length) as daily_avg_length,
    
    -- Get sample messages from the day
    GROUP_CONCAT(
      CASE WHEN ROW_NUMBER() OVER (PARTITION BY date ORDER BY time) <= 3 
      THEN sender || ': ' || SUBSTR(message, 1, 100) || '...'
      END, ' | '
    ) as sample_messages
    
  FROM monthly_messages
  GROUP BY date
  ORDER BY date
),

story_events_month AS (
  SELECT 
    name,
    date_original,
    location,
    rating,
    notes
  FROM our_story
  WHERE story_year || '-' || printf('%02d', 
    CASE story_month
      WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3 WHEN 'April' THEN 4
      WHEN 'May' THEN 5 WHEN 'June' THEN 6 WHEN 'July' THEN 7 WHEN 'August' THEN 8
      WHEN 'September' THEN 9 WHEN 'October' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12
      ELSE 1
    END
  ) = @selected_month
),

daily_tracker_month AS (
  SELECT 
    date,
    connection_score,
    mood_user,
    mood_partner,
    time_together_hours,
    physical_intimacy,
    conflict_occurred,
    conflict_intensity,
    gratitude_note,
    needs_expressed,
    notes
  FROM daily_tracker
  WHERE strftime('%Y-%m', date) = @selected_month
  ORDER BY date
),

journal_entries_month AS (
  SELECT 
    date,
    title,
    content,
    emotional_state,
    insights
  FROM journal_entries
  WHERE strftime('%Y-%m', date) = @selected_month
  ORDER BY date
)

-- Return complete month context for AI analysis
SELECT 
  'MONTH_OVERVIEW' as data_type,
  @selected_month as month,
  
  -- High-level metrics
  (SELECT COUNT(*) FROM monthly_messages) as total_messages,
  (SELECT COUNT(DISTINCT date) FROM monthly_messages) as active_days,
  (SELECT ROUND(AVG(CASE WHEN sentiment_score IS NOT NULL THEN sentiment_score END), 3) FROM monthly_messages) as avg_sentiment,
  (SELECT COUNT(*) FROM monthly_messages WHERE conflict_detected = 1) as total_conflicts,
  (SELECT COUNT(*) FROM story_events_month) as major_events,
  (SELECT COUNT(*) FROM journal_entries_month) as journal_entries,
  
  -- Communication patterns
  (SELECT ROUND(CAST(COUNT(CASE WHEN sender = 'Brandon' THEN 1 END) AS FLOAT) / COUNT(*), 3) FROM monthly_messages) as brandon_ratio,
  (SELECT AVG(message_length) FROM monthly_messages) as avg_message_length,
  (SELECT COUNT(*) FROM monthly_messages WHERE LOWER(message) LIKE '%love%' OR message LIKE '%❤%' OR message LIKE '%💕%') as love_expressions

UNION ALL

-- Daily summaries for trend analysis
SELECT 
  'DAILY_TRENDS' as data_type,
  date,
  daily_message_count,
  brandon_daily_messages,
  user_daily_messages,
  daily_avg_sentiment,
  daily_conflicts,
  daily_love_expressions,
  daily_avg_length,
  sample_messages
FROM daily_summaries

UNION ALL

-- Story events for context
SELECT 
  'STORY_EVENTS' as data_type,
  name,
  date_original,
  location,
  rating,
  notes,
  NULL, NULL, NULL, NULL
FROM story_events_month

UNION ALL

-- Daily tracker entries
SELECT 
  'DAILY_TRACKER' as data_type,
  date,
  connection_score,
  mood_user,
  mood_partner,
  time_together_hours,
  CASE WHEN physical_intimacy = 1 THEN 'Yes' ELSE 'No' END,
  CASE WHEN conflict_occurred = 1 THEN 'Yes' ELSE 'No' END,
  conflict_intensity,
  gratitude_note || ' | Needs: ' || needs_expressed || ' | Notes: ' || notes
FROM daily_tracker_month

UNION ALL

-- Journal entries for emotional context
SELECT 
  'JOURNAL_ENTRIES' as data_type,
  date,
  title,
  SUBSTR(content, 1, 200) || '...',
  emotional_state,
  insights,
  NULL, NULL, NULL, NULL
FROM journal_entries_month

UNION ALL

-- Sample messages for qualitative analysis
SELECT 
  'MESSAGE_SAMPLES' as data_type,
  date || ' ' || time,
  sender,
  message,
  sentiment_score,
  emotional_score,
  category,
  conflict_detected,
  NULL, NULL
FROM (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY date 
      ORDER BY 
        CASE WHEN conflict_detected = 1 THEN 1 ELSE 2 END,
        CASE WHEN LOWER(message) LIKE '%love%' THEN 1 ELSE 2 END,
        RANDOM()
    ) as rn
  FROM monthly_messages
) 
WHERE rn <= 5  -- Top 5 messages per day (conflicts and love first)

ORDER BY data_type, month;