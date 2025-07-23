// src/app/api/conversation-insights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { timeRange: string; filterContext: string };
    const { timeRange, filterContext } = body;

    // Check if we're in local development
    const isLocalDev = process.env.NODE_ENV === 'development';
    
    if (isLocalDev) {
      // Return mock data for local development
      return NextResponse.json({
        success: true,
        insights: {
          totalChunks: 150,
          averageEmotionalIntensity: 7.5,
          averageIntimacyLevel: 6.8,
          averageSupportLevel: 8.2,
          averageConflictLevel: 2.1,
          contextTypeDistribution: [],
          emotionalTrend: [],
          communicationPatterns: [],
          relationshipArc: [],
          topTags: []
        },
        chunks: [],
        message: 'Using mock data for local development'
      });
    }

    const cloudflareContext = await getCloudflareContext();
    const env = cloudflareContext.env as CloudflareEnv;
    
    // First, check what tables exist
    const tablesQuery = await env.DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table'
    `).all();
    
    console.log('Available tables:', tablesQuery?.results);
    
    // Check if conversation_chunks table exists and has data
    const tableExists = tablesQuery?.results?.some((table: Record<string, unknown>) => table.name === 'conversation_chunks');
    
    if (!tableExists) {
      // Fallback to checking texts-bc table
      const textsTableExists = tablesQuery?.results?.some((table: Record<string, unknown>) => table.name === 'texts-bc');
      
      if (textsTableExists) {
        // Use texts-bc table as fallback
        const textsQuery = await env.DB.prepare(`
          SELECT COUNT(*) as count FROM 'texts-bc'
        `).first();
        
        return NextResponse.json({
          success: true,
          insights: {
            totalChunks: Number(textsQuery?.count) || 0,
            averageEmotionalIntensity: 7.5,
            averageIntimacyLevel: 6.8,
            averageSupportLevel: 8.2,
            averageConflictLevel: 2.1,
            contextTypeDistribution: [],
            emotionalTrend: [],
            communicationPatterns: [],
            relationshipArc: [],
            topTags: []
          },
          chunks: [],
          message: 'Using fallback data - conversation_chunks table not found'
        });
      }
      
      return NextResponse.json({
        success: false,
        error: 'No suitable database tables found',
        availableTables: tablesQuery?.results
      }, { status: 404 });
    }
    
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
      
      contextTypeDistribution: contextDistQuery?.results?.map((row: Record<string, unknown>) => ({
        context_type: String(row.context_type || ''),
        count: Number(row.count || 0),
        avg_emotion: Number(row.avg_emotion || 0)
      })) || [],
      
      emotionalTrend: emotionalTrendQuery?.results?.map((row: Record<string, unknown>) => ({
        date: new Date(String(row.date)).toLocaleDateString(),
        emotion: Number(row.emotion || 0),
        intimacy: Number(row.intimacy || 0),
        support: Number(row.support || 0),
        conflict: Number(row.conflict || 0)
      })) || [],
      
      communicationPatterns: communicationPatternsQuery?.results?.map((row: Record<string, unknown>) => ({
        pattern: String(row.pattern || ''),
        frequency: Number(row.frequency || 0),
        avg_emotion: Number(row.avg_emotion || 0)
      })) || [],
      
      relationshipArc: relationshipArcQuery?.results?.map((row: Record<string, unknown>) => ({
        month: String(row.month || ''),
        emotional_health: Number(row.emotional_health || 0),
        conversations: Number(row.conversations || 0)
      })) || [],
      
      topTags: topTagsQuery?.results?.map((row: Record<string, unknown>) => ({
        tag: String(row.tag || ''),
        frequency: Number(row.frequency || 0),
        emotional_context: String(row.emotional_context || '')
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
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}