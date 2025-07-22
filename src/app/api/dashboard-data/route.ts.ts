// src/app/api/dashboard-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface Env {
  DB: D1Database;
}

export async function POST(request: NextRequest) {
  try {
    const { env } = getCloudflareContext<Env>();
    const { dateRange } = await request.json();
    
    // Calculate date filter
    let dateFilter = '';
    if (dateRange !== 'all') {
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      const cutoffDateString = cutoffDate.toISOString().split('T')[0];
      dateFilter = `AND date >= '${cutoffDateString}'`;
    }
    
    // Get basic stats
    const statsQuery = await env.DB.prepare(`
      SELECT 
        COUNT(*) as totalMessages,
        AVG(emotional_score) as averageEmotionalScore,
        AVG(CAST(conflict_indicator AS FLOAT)) as conflictRate
      FROM 'texts-bc' 
      WHERE message IS NOT NULL 
      AND processed_at IS NOT NULL 
      ${dateFilter}
    `).first();
    
    // Get sentiment distribution
    const sentimentQuery = await env.DB.prepare(`
      SELECT 
        sentiment,
        COUNT(*) as count
      FROM 'texts-bc' 
      WHERE sentiment IS NOT NULL 
      AND sentiment != ''
      ${dateFilter}
      GROUP BY sentiment
      ORDER BY count DESC
    `).all();
    
    // Get top tags
    const tagsQuery = await env.DB.prepare(`
      SELECT 
        tag,
        COUNT(*) as count
      FROM 'texts-bc' 
      WHERE tag IS NOT NULL 
      AND tag != ''
      ${dateFilter}
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 10
    `).all();
    
    // Get daily emotional trend (last 30 days)
    const trendQuery = await env.DB.prepare(`
      SELECT 
        DATE(date_time) as date,
        AVG(emotional_score) as score,
        COUNT(*) as messageCount
      FROM 'texts-bc' 
      WHERE emotional_score IS NOT NULL 
      AND date_time >= date('now', '-30 days')
      GROUP BY DATE(date_time)
      ORDER BY date ASC
    `).all();
    
    // Get recent processed messages
    const messagesQuery = await env.DB.prepare(`
      SELECT 
        id, date, sender, message, sentiment, 
        emotional_score, tags_json, conflict_indicator, 
        relationship_context
      FROM 'texts-bc' 
      WHERE processed_at IS NOT NULL
      ${dateFilter}
      ORDER BY date_time DESC
      LIMIT 50
    `).all();
    
    // Format the response
    const stats = {
      totalMessages: statsQuery?.totalMessages || 0,
      averageEmotionalScore: Number(statsQuery?.averageEmotionalScore || 0),
      conflictRate: Number(statsQuery?.conflictRate || 0),
      topTags: tagsQuery?.results?.map((row: any) => ({
        tag: row.tag,
        count: row.count
      })) || [],
      sentimentDistribution: sentimentQuery?.results?.map((row: any) => ({
        sentiment: row.sentiment,
        count: row.count
      })) || [],
      dailyEmotionalTrend: trendQuery?.results?.map((row: any) => ({
        date: new Date(row.date).toLocaleDateString(),
        score: Number(row.score || 0),
        messageCount: row.messageCount
      })) || []
    };
    
    return NextResponse.json({
      success: true,
      stats,
      messages: messagesQuery?.results || []
    });
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data'
    }, { status: 500 });
  }
}