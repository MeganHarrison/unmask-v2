// Enhanced conversations page with deep relationship insights
import { getCloudflareContext } from '@opennextjs/cloudflare';
import ConversationsClient from './conversations-client';

interface ConversationChunk {
  id: number;
  start_time: string;
  end_time: string;
  message_count: number;
  chunk_summary: string;
  emotional_tone: string;
  conflict_detected: boolean;
  sentiment_score: number;
  participants: string;
  conversation_type: string;
  relationship_id: number;
  created_at: string;
  updated_at: string;
}

interface ConversationStats {
  totalConversations: number;
  averageSentiment: number;
  conflictRate: number;
  emotionalBreakdown: Record<string, number>;
  topicsDiscussed: Array<{ topic: string; count: number }>;
  communicationPatterns: {
    averageMessagesPerConversation: number;
    averageConversationDuration: number;
    peakHours: Array<{ hour: number; count: number }>;
  };
}

interface SearchParams {
  dateRange?: string;
  emotionalTone?: string;
  conflictOnly?: string;
  search?: string;
  tag?: string;
}

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  try {
    const params = await searchParams;
    const { env } = await getCloudflareContext({ async: true });
    const db = env.DB;

    // Build dynamic query based on filters
    let query = `SELECT * FROM conversation_chunks WHERE 1=1`;
    const queryParams: any[] = [];

    if (params.emotionalTone && params.emotionalTone !== 'all') {
      query += ` AND emotional_tone = ?`;
      queryParams.push(params.emotionalTone);
    }

    if (params.conflictOnly === 'true') {
      query += ` AND conflict_detected = 1`;
    }

    if (params.search) {
      query += ` AND chunk_summary LIKE ?`;
      queryParams.push(`%${params.search}%`);
    }

    // Date range filter
    if (params.dateRange) {
      const [start, end] = params.dateRange.split('to');
      if (start && end) {
        query += ` AND start_time BETWEEN ? AND ?`;
        queryParams.push(start.trim(), end.trim());
      }
    }

    query += ` ORDER BY start_time DESC LIMIT 50`;

    const result = await db.prepare(query).bind(...queryParams).all() as { results: ConversationChunk[] };
    const conversations = result.results || [];

    // Calculate statistics
    const statsResult = await db.prepare(`
      SELECT 
        COUNT(*) as total,
        AVG(sentiment_score) as avg_sentiment,
        SUM(CASE WHEN conflict_detected = 1 THEN 1 ELSE 0 END) as conflicts,
        COUNT(DISTINCT DATE(start_time)) as days_active
      FROM conversation_chunks
    `).first() as any;

    // Get emotional tone breakdown
    const emotionalBreakdownResult = await db.prepare(`
      SELECT emotional_tone, COUNT(*) as count
      FROM conversation_chunks
      GROUP BY emotional_tone
    `).all() as { results: Array<{ emotional_tone: string; count: number }> };

    // Get conversation types/topics
    const topicsResult = await db.prepare(`
      SELECT conversation_type, COUNT(*) as count
      FROM conversation_chunks
      WHERE conversation_type IS NOT NULL
      GROUP BY conversation_type
      ORDER BY count DESC
      LIMIT 10
    `).all() as { results: Array<{ conversation_type: string; count: number }> };

    // Get hourly patterns
    const hourlyResult = await db.prepare(`
      SELECT 
        CAST(strftime('%H', start_time) AS INTEGER) as hour,
        COUNT(*) as count
      FROM conversation_chunks
      GROUP BY hour
      ORDER BY hour
    `).all() as { results: Array<{ hour: number; count: number }> };

    // Get recent tags
    const tagsResult = await db.prepare(`
      SELECT DISTINCT tag_name, tag_color
      FROM conversation_tags
      ORDER BY created_at DESC
      LIMIT 20
    `).all().catch(() => ({ results: [] })); // Handle if tags table doesn't exist yet

    const stats: ConversationStats = {
      totalConversations: Number(statsResult?.total || 0),
      averageSentiment: Number(statsResult?.avg_sentiment || 0),
      conflictRate: statsResult?.total > 0 
        ? (Number(statsResult?.conflicts || 0) / Number(statsResult?.total))
        : 0,
      emotionalBreakdown: emotionalBreakdownResult.results.reduce((acc, item) => {
        acc[item.emotional_tone] = item.count;
        return acc;
      }, {} as Record<string, number>),
      topicsDiscussed: topicsResult.results.map(item => ({
        topic: item.conversation_type,
        count: item.count
      })),
      communicationPatterns: {
        averageMessagesPerConversation: conversations.length > 0
          ? conversations.reduce((sum, c) => sum + c.message_count, 0) / conversations.length
          : 0,
        averageConversationDuration: conversations.length > 0
          ? conversations.reduce((sum, c) => {
              const duration = new Date(c.end_time).getTime() - new Date(c.start_time).getTime();
              return sum + duration;
            }, 0) / conversations.length / 60000 // Convert to minutes
          : 0,
        peakHours: hourlyResult.results || []
      }
    };

    return <ConversationsClient initialConversations={conversations} initialStats={stats} />;
  } catch (error) {
    console.error('Server error:', error);
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p className="text-red-600">
          Failed to load conversations: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
}