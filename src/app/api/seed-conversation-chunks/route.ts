import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB;

    // First, ensure we have a relationship record
    const relationshipCheck = await db.prepare(`
      SELECT id FROM relationships WHERE id = 1
    `).first();

    if (!relationshipCheck) {
      await db.prepare(`
        INSERT INTO relationships (id, name, partner_name, status)
        VALUES (1, 'Primary Relationship', 'Partner', 'active')
      `).run();
    }

    // Insert sample conversation chunks with sentiment scores
    const sampleData = [
      {
        start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        message_count: 45,
        chunk_summary: 'Discussion about weekend plans and upcoming vacation. Positive tone throughout with excitement about travel destinations.',
        emotional_tone: 'positive',
        conflict_detected: false,
        sentiment_score: 8.5,
        participants: 'You, Partner',
        conversation_type: 'planning',
        relationship_id: 1
      },
      {
        start_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        message_count: 23,
        chunk_summary: 'Disagreement about household chores and responsibilities. Some tension but resolved constructively.',
        emotional_tone: 'mixed',
        conflict_detected: true,
        sentiment_score: 5.2,
        participants: 'You, Partner',
        conversation_type: 'conflict',
        relationship_id: 1
      },
      {
        start_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        message_count: 15,
        chunk_summary: 'Quick check-in during work day. Sharing funny memes and brief updates.',
        emotional_tone: 'positive',
        conflict_detected: false,
        sentiment_score: 7.8,
        participants: 'You, Partner',
        conversation_type: 'casual',
        relationship_id: 1
      },
      {
        start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        message_count: 67,
        chunk_summary: 'Long conversation about future goals and relationship milestones. Deep emotional connection expressed.',
        emotional_tone: 'positive',
        conflict_detected: false,
        sentiment_score: 9.2,
        participants: 'You, Partner',
        conversation_type: 'deep-talk',
        relationship_id: 1
      },
      {
        start_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        message_count: 28,
        chunk_summary: 'Planning dinner and discussing work stress. Supportive and understanding tone.',
        emotional_tone: 'neutral',
        conflict_detected: false,
        sentiment_score: 6.5,
        participants: 'You, Partner',
        conversation_type: 'daily-life',
        relationship_id: 1
      }
    ];

    // Insert each record
    for (const data of sampleData) {
      await db.prepare(`
        INSERT INTO conversation_chunks (
          start_time, end_time, message_count, chunk_summary, 
          emotional_tone, conflict_detected, sentiment_score, 
          participants, conversation_type, relationship_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.start_time,
        data.end_time,
        data.message_count,
        data.chunk_summary,
        data.emotional_tone,
        data.conflict_detected ? 1 : 0,
        data.sentiment_score,
        data.participants,
        data.conversation_type,
        data.relationship_id
      ).run();
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully',
      count: sampleData.length
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to seed data'
    }, { status: 500 });
  }
}