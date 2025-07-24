import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { env } = await getCloudflareContext();
    const db = env.DB;

    // Inline SQL statements since file reading doesn't work in Edge runtime
    const sqlContent = `
-- Create conversation_chunks table for text message analysis
CREATE TABLE IF NOT EXISTS conversation_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  message_count INTEGER DEFAULT 0,
  chunk_summary TEXT,
  emotional_tone TEXT CHECK(emotional_tone IN ('positive', 'negative', 'neutral', 'mixed')),
  conflict_detected BOOLEAN DEFAULT FALSE,
  sentiment_score REAL DEFAULT 5.0 CHECK(sentiment_score >= 0 AND sentiment_score <= 10),
  participants TEXT,
  conversation_type TEXT,
  relationship_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (relationship_id) REFERENCES relationships(id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_conversation_chunks_relationship_time 
ON conversation_chunks(relationship_id, start_time);

-- Create conversation_tags table for tagging conversations
CREATE TABLE IF NOT EXISTS conversation_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_chunk_id INTEGER NOT NULL,
  tag_name TEXT NOT NULL,
  tag_color TEXT DEFAULT '#6B7280',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_chunk_id) REFERENCES conversation_chunks(id) ON DELETE CASCADE
);

-- Create index for tag queries
CREATE INDEX IF NOT EXISTS idx_conversation_tags_chunk_id 
ON conversation_tags(conversation_chunk_id);

-- Sample data for testing (remove in production)
INSERT INTO conversation_chunks (
  start_time, 
  end_time, 
  message_count, 
  chunk_summary, 
  emotional_tone, 
  conflict_detected, 
  sentiment_score, 
  participants, 
  conversation_type, 
  relationship_id
) VALUES 
(
  datetime('now', '-7 days'),
  datetime('now', '-7 days', '+2 hours'),
  45,
  'Discussion about weekend plans and upcoming vacation. Positive tone throughout with excitement about travel destinations.',
  'positive',
  0,
  8.5,
  'You, Partner',
  'planning',
  1
),
(
  datetime('now', '-5 days'),
  datetime('now', '-5 days', '+1 hour'),
  23,
  'Disagreement about household chores and responsibilities. Some tension but resolved constructively.',
  'mixed',
  1,
  5.2,
  'You, Partner',
  'conflict',
  1
),
(
  datetime('now', '-3 days'),
  datetime('now', '-3 days', '+30 minutes'),
  15,
  'Quick check-in during work day. Sharing funny memes and brief updates.',
  'positive',
  0,
  7.8,
  'You, Partner',
  'casual',
  1
),
(
  datetime('now', '-2 days'),
  datetime('now', '-2 days', '+3 hours'),
  67,
  'Long conversation about future goals and relationship milestones. Deep emotional connection expressed.',
  'positive',
  0,
  9.2,
  'You, Partner',
  'deep-talk',
  1
),
(
  datetime('now', '-1 day'),
  datetime('now', '-1 day', '+45 minutes'),
  28,
  'Planning dinner and discussing work stress. Supportive and understanding tone.',
  'neutral',
  0,
  6.5,
  'You, Partner',
  'daily-life',
  1
);

-- Add some sample tags
INSERT INTO conversation_tags (conversation_chunk_id, tag_name, tag_color) VALUES
(1, 'vacation-planning', '#10B981'),
(2, 'conflict', '#EF4444'),
(2, 'resolved', '#10B981'),
(4, 'milestone', '#8B5CF6'),
(4, 'emotional', '#EC4899');
`;

    // Split the SQL content by semicolons to execute each statement separately
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    const results = [];
    const errors = [];

    // Filter out pure comment lines and process each statement
    for (const statement of statements) {
      // Skip pure comment lines
      const cleanStatement = statement.split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim();
      
      if (!cleanStatement) continue;
      
      try {
        await db.prepare(cleanStatement).run();
        results.push({
          statement: cleanStatement.substring(0, 50) + '...',
          status: 'success'
        });
      } catch (error) {
        errors.push({
          statement: cleanStatement.substring(0, 50) + '...',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Get updated table list
    const tablesResult = await db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%' 
      AND name NOT LIKE '_cf_%'
      ORDER BY name
    `).all();

    return NextResponse.json({
      success: errors.length === 0,
      message: errors.length === 0 ? 'Migration completed successfully' : 'Migration completed with some errors',
      results,
      errors,
      tables: tablesResult.results
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed'
    }, { status: 500 });
  }
}