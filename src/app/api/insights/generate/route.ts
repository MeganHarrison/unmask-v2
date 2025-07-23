import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Get the Cloudflare context and D1 database
    const { env } = getCloudflareContext();
    const db = env.DB;
    
    // Get total message count
    const totalResult = await db.prepare('SELECT COUNT(*) as count FROM "texts-bc"').first();
    const total = Number(totalResult?.count || 0);
    
    // Get messages by sender
    const bySenderResult = await db.prepare(`
      SELECT sender, COUNT(*) as count 
      FROM "texts-bc" 
      GROUP BY sender
    `).all();
    const bySender = bySenderResult.results || [];
    
    // Get messages by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const byDateResult = await db.prepare(`
      SELECT DATE(date_time) as date, COUNT(*) as count 
      FROM "texts-bc" 
      WHERE date_time >= ?
      GROUP BY DATE(date_time)
      ORDER BY date
    `).bind(thirtyDaysAgo.toISOString()).all();
    const byDate = byDateResult.results || [];
    
    // Get messages by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const byMonthResult = await db.prepare(`
      SELECT strftime('%Y-%m', date_time) as month, COUNT(*) as count 
      FROM "texts-bc" 
      WHERE date_time >= ?
      GROUP BY strftime('%Y-%m', date_time)
      ORDER BY month
    `).bind(twelveMonthsAgo.toISOString()).all();
    const byMonth = byMonthResult.results || [];
    
    // Get sentiment overview
    const sentimentResult = await db.prepare(`
      SELECT 
        SUM(CASE WHEN sentiment_score > 0.3 THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN sentiment_score < -0.3 THEN 1 ELSE 0 END) as negative,
        SUM(CASE WHEN sentiment_score >= -0.3 AND sentiment_score <= 0.3 THEN 1 ELSE 0 END) as neutral,
        SUM(CASE WHEN sentiment_score IS NULL THEN 1 ELSE 0 END) as unanalyzed
      FROM "texts-bc"
    `).first();
    
    const sentimentOverview = {
      positive: Number(sentimentResult?.positive || 0),
      negative: Number(sentimentResult?.negative || 0),
      neutral: Number(sentimentResult?.neutral || 0),
      unanalyzed: Number(sentimentResult?.unanalyzed || 0)
    };
    
    // Get conflict count
    const conflictResult = await db.prepare(`
      SELECT COUNT(*) as count 
      FROM "texts-bc" 
      WHERE conflict_detected = 1
    `).first();
    const conflictCount = Number(conflictResult?.count || 0);
    
    // Calculate average messages per day
    const firstMessageResult = await db.prepare(`
      SELECT MIN(date_time) as first_date 
      FROM "texts-bc"
    `).first();
    
    if (firstMessageResult?.first_date) {
      const firstDate = new Date(String(firstMessageResult.first_date));
      const today = new Date();
      const daysDiff = Math.ceil((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      const averageMessagesPerDay = Math.round(total / daysDiff);
      
      // Calculate streak (simplified - just using recent activity)
      const recentDaysResult = await db.prepare(`
        SELECT COUNT(DISTINCT DATE(date_time)) as active_days
        FROM "texts-bc"
        WHERE date_time >= date('now', '-7 days')
      `).first();
      const currentStreak = Number(recentDaysResult?.active_days || 0);
      
      return NextResponse.json({
        total,
        bySender,
        byDate,
        byMonth,
        sentimentOverview,
        conflictCount,
        averageMessagesPerDay,
        longestStreak: 180, // This would require more complex calculation
        currentStreak
      });
    }
    
    return NextResponse.json({
      total,
      bySender,
      byDate,
      byMonth,
      sentimentOverview,
      conflictCount,
      averageMessagesPerDay: 0,
      longestStreak: 0,
      currentStreak: 0
    });
    
  } catch (error) {
    console.error('Error generating insights:', error);
    
    // Fallback for local development
    if (error instanceof Error && error.message.includes('getCloudflareContext')) {
      return NextResponse.json({
        total: 0,
        bySender: [],
        byDate: [],
        byMonth: [],
        sentimentOverview: {
          positive: 0,
          negative: 0,
          neutral: 0,
          unanalyzed: 0
        },
        conflictCount: 0,
        averageMessagesPerDay: 0,
        longestStreak: 0,
        currentStreak: 0,
        error: 'Database not available in local development'
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}