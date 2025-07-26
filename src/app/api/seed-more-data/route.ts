import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB;

    // Add data for multiple months to show relationship progression
    const monthlyData = [
      // January 2025
      { date: '2025-01-15', score: 7.2, summary: 'New Year reflections and goal setting together' },
      { date: '2025-01-22', score: 6.8, summary: 'Minor disagreement about finances, resolved calmly' },
      { date: '2025-01-28', score: 7.5, summary: 'Planning Valentine\'s Day together' },
      
      // February 2025
      { date: '2025-02-14', score: 9.5, summary: 'Amazing Valentine\'s Day celebration' },
      { date: '2025-02-20', score: 8.0, summary: 'Supporting each other through work stress' },
      { date: '2025-02-26', score: 7.8, summary: 'Fun weekend getaway' },
      
      // March 2025
      { date: '2025-03-10', score: 6.5, summary: 'Tension about time management and priorities' },
      { date: '2025-03-18', score: 5.8, summary: 'Ongoing conflict about household responsibilities' },
      { date: '2025-03-25', score: 7.0, summary: 'Made up after conflict, feeling closer' },
      
      // April 2025
      { date: '2025-04-05', score: 7.5, summary: 'Spring cleaning and organizing together' },
      { date: '2025-04-15', score: 8.2, summary: 'Celebrating career milestone together' },
      { date: '2025-04-28', score: 8.5, summary: 'Planning summer vacation, very excited' },
      
      // May 2025
      { date: '2025-05-10', score: 8.8, summary: 'Anniversary celebration, feeling grateful' },
      { date: '2025-05-20', score: 8.0, summary: 'Deep conversation about future plans' },
      { date: '2025-05-30', score: 7.6, summary: 'Normal daily life, comfortable routine' },
      
      // June 2025
      { date: '2025-06-08', score: 8.3, summary: 'Fun summer activities together' },
      { date: '2025-06-18', score: 7.9, summary: 'Supporting each other through family issues' },
      { date: '2025-06-28', score: 8.7, summary: 'Great communication and connection lately' }
    ];

    // Insert each record
    for (const data of monthlyData) {
      const startTime = new Date(data.date + 'T10:00:00Z');
      const endTime = new Date(data.date + 'T12:00:00Z');
      
      await db.prepare(`
        INSERT INTO conversation_chunks (
          start_time, end_time, message_count, chunk_summary, 
          emotional_tone, conflict_detected, sentiment_score, 
          participants, conversation_type, relationship_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        startTime.toISOString(),
        endTime.toISOString(),
        Math.floor(Math.random() * 50) + 20, // Random message count 20-70
        data.summary,
        data.score >= 7 ? 'positive' : data.score >= 5 ? 'mixed' : 'negative',
        data.score < 6 ? 1 : 0,
        data.score,
        'You, Partner',
        data.score >= 8 ? 'deep-talk' : data.score >= 6 ? 'daily-life' : 'conflict',
        1
      ).run();
    }

    return NextResponse.json({
      success: true,
      message: 'Additional data seeded successfully',
      count: monthlyData.length
    });
  } catch (error) {
    console.error('Error seeding additional data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to seed data'
    }, { status: 500 });
  }
}