// app/api/conversations/route.ts
// API for conversation_chunks table instead of individual messages

export const runtime = 'edge';

import { NextRequest } from 'next/server';

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

export async function GET(request: NextRequest, { env }: { env: any }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const emotionalTone = searchParams.get('emotionalTone') || '';
    const conversationType = searchParams.get('conversationType') || '';
    const conflictFilter = searchParams.get('conflictFilter') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const offset = (page - 1) * limit;

    const db = env.DB;
    
    if (!db) {
      throw new Error('Database connection not available');
    }

    // Build the query dynamically based on filters
    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push('chunk_summary LIKE ?');
      params.push(`%${search}%`);
    }

    if (emotionalTone) {
      whereConditions.push('emotional_tone = ?');
      params.push(emotionalTone);
    }

    if (conversationType) {
      whereConditions.push('conversation_type = ?');
      params.push(conversationType);
    }

    if (conflictFilter === 'conflicts') {
      whereConditions.push('conflict_detected = 1');
    } else if (conflictFilter === 'peaceful') {
      whereConditions.push('conflict_detected = 0');
    }

    if (startDate) {
      whereConditions.push('start_time >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('end_time <= ?');
      params.push(endDate + ' 23:59:59');
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get conversation chunks with filters
    const chunksQuery = `
      SELECT * FROM conversation_chunks 
      ${whereClause}
      ORDER BY start_time DESC 
      LIMIT ? OFFSET ?
    `;
    
    const result = await db.prepare(chunksQuery)
      .bind(...params, limit, offset)
      .all();

    // Get total count with same filters
    const countQuery = `
      SELECT COUNT(*) as count FROM conversation_chunks 
      ${whereClause}
    `;
    
    const countResult = await db.prepare(countQuery)
      .bind(...params)
      .first();

    const totalCount = countResult?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Transform chunks to ensure proper data types
    const conversations = (result.results || []).map((chunk: any) => ({
      id: chunk.id,
      start_time: chunk.start_time,
      end_time: chunk.end_time,
      message_count: chunk.message_count || 0,
      chunk_summary: chunk.chunk_summary || '',
      emotional_tone: chunk.emotional_tone || 'neutral',
      conflict_detected: !!chunk.conflict_detected,
      sentiment_score: chunk.sentiment_score || 0,
      participants: chunk.participants || '',
      conversation_type: chunk.conversation_type || 'general',
      relationship_id: chunk.relationship_id || 1,
      created_at: chunk.created_at,
      updated_at: chunk.updated_at
    }));

    return new Response(
      JSON.stringify({
        conversations,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: {
          search,
          emotionalTone,
          conversationType,
          conflictFilter,
          startDate,
          endDate
        },
        metadata: {
          databaseId: 'f450193b-9536-4ada-8271-2a8cd917069e',
          searchType: 'conversation_chunks',
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );

  } catch (error) {
    console.error('Conversations API Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch conversations',
        message: error instanceof Error ? error.message : 'Unknown error',
        conversations: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}