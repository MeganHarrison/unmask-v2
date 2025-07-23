import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const runtime = 'edge';

interface MessageStats {
  total: number;
  bySender: { sender: string; count: number }[];
  byDate: { date: string; count: number }[];
  byMonth: { month: string; count: number }[];
  sentimentOverview: {
    positive: number;
    negative: number;
    neutral: number;
    unanalyzed: number;
  };
  conflictCount: number;
  averageMessagesPerDay: number;
  longestStreak: number;
  currentStreak: number;
}

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB;

    const searchParams = request.nextUrl.searchParams;
    const relationshipId = parseInt(searchParams.get('relationshipId') || '1');
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build date conditions
    let dateCondition = '';
    const params: any[] = [relationshipId];
    
    if (startDate) {
      dateCondition += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      dateCondition += ' AND date <= ?';
      params.push(endDate);
    }

    // Get total message count
    const totalQuery = `
      SELECT COUNT(*) as total 
      FROM "texts-bc" 
      WHERE relationship_id = ?${dateCondition}
    `;
    const totalResult = await db.prepare(totalQuery).bind(...params).first<{ total: number }>();

    // Get messages by sender
    const bySenderQuery = `
      SELECT sender, COUNT(*) as count 
      FROM "texts-bc" 
      WHERE relationship_id = ?${dateCondition}
      GROUP BY sender
      ORDER BY count DESC
    `;
    const { results: bySender } = await db.prepare(bySenderQuery).bind(...params).all<{ sender: string; count: number }>();

    // Get messages by date (last 30 days)
    const byDateQuery = `
      SELECT DATE(date_time) as date, COUNT(*) as count 
      FROM "texts-bc" 
      WHERE relationship_id = ? 
      AND date >= date('now', '-30 days')${dateCondition.replace('date', 'DATE(date_time)')}
      GROUP BY DATE(date_time)
      ORDER BY date DESC
    `;
    const { results: byDate } = await db.prepare(byDateQuery).bind(relationshipId).all<{ date: string; count: number }>();

    // Get messages by month
    const byMonthQuery = `
      SELECT strftime('%Y-%m', date_time) as month, COUNT(*) as count 
      FROM "texts-bc" 
      WHERE relationship_id = ?${dateCondition}
      GROUP BY strftime('%Y-%m', date_time)
      ORDER BY month DESC
      LIMIT 12
    `;
    const { results: byMonth } = await db.prepare(byMonthQuery).bind(...params).all<{ month: string; count: number }>();

    // Get sentiment overview
    const sentimentQuery = `
      SELECT 
        SUM(CASE WHEN sentiment_score > 0.3 THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN sentiment_score < -0.3 THEN 1 ELSE 0 END) as negative,
        SUM(CASE WHEN sentiment_score BETWEEN -0.3 AND 0.3 AND sentiment_score IS NOT NULL THEN 1 ELSE 0 END) as neutral,
        SUM(CASE WHEN sentiment_score IS NULL THEN 1 ELSE 0 END) as unanalyzed
      FROM "texts-bc" 
      WHERE relationship_id = ?${dateCondition}
    `;
    const sentimentResult = await db.prepare(sentimentQuery).bind(...params).first<{
      positive: number;
      negative: number;
      neutral: number;
      unanalyzed: number;
    }>();

    // Get conflict count
    const conflictQuery = `
      SELECT COUNT(*) as count 
      FROM "texts-bc" 
      WHERE relationship_id = ? 
      AND conflict_detected = true${dateCondition}
    `;
    const conflictResult = await db.prepare(conflictQuery).bind(...params).first<{ count: number }>();

    // Calculate average messages per day
    const daysQuery = `
      SELECT 
        COUNT(DISTINCT DATE(date_time)) as days,
        MIN(DATE(date_time)) as first_date,
        MAX(DATE(date_time)) as last_date
      FROM "texts-bc" 
      WHERE relationship_id = ?${dateCondition}
    `;
    const daysResult = await db.prepare(daysQuery).bind(...params).first<{
      days: number;
      first_date: string;
      last_date: string;
    }>();

    const averageMessagesPerDay = daysResult?.days ? Math.round(totalResult!.total / daysResult.days) : 0;

    // Calculate message streaks
    const streakQuery = `
      WITH consecutive_days AS (
        SELECT 
          DATE(date_time) as message_date,
          DATE(date_time, '-' || ROW_NUMBER() OVER (ORDER BY DATE(date_time)) || ' days') as grp
        FROM (
          SELECT DISTINCT DATE(date_time) as date_time
          FROM "texts-bc"
          WHERE relationship_id = ?${dateCondition}
        )
      ),
      streaks AS (
        SELECT 
          MIN(message_date) as start_date,
          MAX(message_date) as end_date,
          COUNT(*) as streak_length
        FROM consecutive_days
        GROUP BY grp
      )
      SELECT 
        MAX(streak_length) as longest_streak,
        (SELECT streak_length FROM streaks WHERE end_date = DATE('now') LIMIT 1) as current_streak
      FROM streaks
    `;
    const streakResult = await db.prepare(streakQuery).bind(...params).first<{
      longest_streak: number;
      current_streak: number | null;
    }>();

    const stats: MessageStats = {
      total: totalResult?.total || 0,
      bySender,
      byDate: byDate.reverse(), // Reverse to show chronologically
      byMonth: byMonth.reverse(), // Reverse to show chronologically
      sentimentOverview: sentimentResult || { positive: 0, negative: 0, neutral: 0, unanalyzed: 0 },
      conflictCount: conflictResult?.count || 0,
      averageMessagesPerDay,
      longestStreak: streakResult?.longest_streak || 0,
      currentStreak: streakResult?.current_streak || 0
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}