// src/app/api/conversation-insights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface Env {
  DB: D1Database;
}

export async function POST(request: NextRequest) {
  try {
    const { env } = getCloudflareContext<Env>();
    const { timeRange, filterContext } = await request.json();
    
    // Calculate time filter
    let timeFilter = '';
    if (timeRange !== 'all') {
      let days = 365; // default for 'all'
      switch (timeRange) {
        case '1month': days = 30; break;
        case '3months': days = 90; break;
        case '6months': days = 180; break;
      }
      timeFilter = `AND start_time >= datetime('now', '-${days} days')`;
    }
    
    // Calculate context filter
    let contextFilter = '';
    if (filterContext !== 'all') {
      contextFilter = `AND context_type = '${filterContext}'`;
    }
    
    // Get basic conversation insights
    const statsQuery = await env.DB.prepare(`
      SELECT 
        COUNT(*) as totalChunks,
        AVG(emotional_intensity) as averageEmotionalIntensity,
        AVG(intimacy_level) as averageIntimacyLevel,
        AVG(support_level) as averageSupportLevel,
        AVG(conflict_level) as averageConflictLevel
      FROM conversation_chunks 
      WHERE 1=1 
      ${timeFilter} 
      ${contextFilter}
    `).first();
    
    // Get context type distribution
    const contextDistQuery = await env.DB.prepare(`
      SELECT 
        context_type,
        COUNT(*) as count,
        AVG(emotional_intensity) as avg_emotion
      FROM conversation_chunks 
      WHERE 1=1 
      ${timeFilter}
      GROUP BY context_type
      ORDER BY count DESC
      LIMIT 10
    `).all();
    
    // Get daily emotional trend (last 30 days)
    const emotionalTrendQuery = await env.DB.prepare(`
      SELECT 
        DATE(start_time) as date,
        AVG(emotional_intensity) as emotion,
        AVG(intimacy_level) as intimacy,
        AVG(support_level) as support,
        AVG(conflict_level) as conflict
      FROM conversation_chunks 
      WHERE start_time >= datetime('now', '-30 days')
      GROUP BY DATE(start_time)
      ORDER BY date ASC
    `).all();
    
    // Get communication patterns
    const communicationPatternsQuery = await env.DB.prepare(`
      SELECT 
        communication_pattern as pattern,
        COUNT(*) as frequency,
        AVG(emotional_intensity) as avg_emotion
      FROM conversation_chunks 
      WHERE communication_pattern IS NOT NULL 
      ${timeFilter} 
      ${contextFilter}
      GROUP BY communication_pattern
      ORDER BY frequency DESC
      LIMIT 8
    `).all();
    
    // Get monthly relationship health arc
    const relationshipArcQuery = await env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', start_time) as month,
        AVG((emotional_intensity + intimacy_level + support_level - conflict_level) / 3.0) as emotional_health,
        COUNT(*) as conversations
      FROM conversation_chunks 
      WHERE start_time >= datetime('now', '-12 months')
      GROUP BY strftime('%Y-%m', start_time)
      ORDER BY month DESC
      LIMIT 12
    `).all();
    
    // Get top tags from conversation analysis
    const topTagsQuery = await env.DB.prepare(`
      SELECT 
        tag,
        COUNT(*) as frequency,
        'Analysis of relationship themes and patterns' as emotional_context
      FROM (
        SELECT TRIM(value) as tag
        FROM conversation_chunks,
        json_each(CASE WHEN json_valid(tags_json) THEN tags_json ELSE '[]' END)
        WHERE tags_json IS NOT NULL 
        AND tags_json != ''
        ${timeFilter}
        ${contextFilter}
      ) WHERE tag != ''
      GROUP BY tag
      ORDER BY frequency DESC
      LIMIT 12
    `).all();
    
    // Get recent conversation chunks for display
    const recentChunksQuery = await env.DB.prepare(`
      SELECT 
        chunk_id, start_time, end_time, message_count,
        context_type, emotional_intensity, intimacy_level,
        support_level, conflict_level, communication_pattern,
        temporal_context, relationship_dynamics, tags_json,
        SUBSTR(chunk_text, 1, 200) as chunk_preview
      FROM conversation_chunks 
      WHERE 1=1 
      ${timeFilter} 
      ${contextFilter}
      ORDER BY start_time DESC
      LIMIT 50
    `).all();
    
    // Format the insights response
    const insights = {
      totalChunks: statsQuery?.totalChunks || 0,
      averageEmotionalIntensity: Number(statsQuery?.averageEmotionalIntensity || 0),
      averageIntimacyLevel: Number(statsQuery?.averageIntimacyLevel || 0),
      averageSupportLevel: Number(statsQuery?.averageSupportLevel || 0),
      averageConflictLevel: Number(statsQuery?.averageConflictLevel || 0),
      
      contextTypeDistribution: contextDistQuery?.results?.map((row: any) => ({
        context_type: row.context_type,
        count: row.count,
        avg_emotion: Number(row.avg_emotion || 0)
      })) || [],
      
      emotionalTrend: emotionalTrendQuery?.results?.map((row: any) => ({
        date: new Date(row.date).toLocaleDateString(),
        emotion: Number(row.emotion || 0),
        intimacy: Number(row.intimacy || 0),
        support: Number(row.support || 0),
        conflict: Number(row.conflict || 0)
      })) || [],
      
      communicationPatterns: communicationPatternsQuery?.results?.map((row: any) => ({
        pattern: row.pattern,
        frequency: row.frequency,
        avg_emotion: Number(row.avg_emotion || 0)
      })) || [],
      
      relationshipArc: relationshipArcQuery?.results?.map((row: any) => ({
        month: row.month,
        emotional_health: Number(row.emotional_health || 0),
        conversations: row.conversations
      })) || [],
      
      topTags: topTagsQuery?.results?.map((row: any) => ({
        tag: row.tag,
        frequency: row.frequency,
        emotional_context: row.emotional_context
      })) || []
    };
    
    return NextResponse.json({
      success: true,
      insights,
      chunks: recentChunksQuery?.results || []
    });
    
  } catch (error) {
    console.error('Conversation insights API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch conversation insights',
      details: error.message
    }, { status: 500 });
  }
}