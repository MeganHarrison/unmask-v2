// app/api/messages/route.ts
// Fix pagination property names to match your frontend

export const runtime = 'edge';

import { NextRequest } from 'next/server';

interface Message {
  id: number;
  date: string;
  time: string;
  date_time: string;
  type: string;
  sender: string;
  message: string;
  attachment: string | null;
  sentiment: string | null;
  sentiment_score: number | null;
  conflict_detected: boolean;
  emotional_score: number | null;
  tags_json: string | null;
  relationship_id: number;
}

export async function GET(request: NextRequest, { env }: { env: any }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const sender = searchParams.get('sender') || '';
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
      whereConditions.push('(message LIKE ? OR sender LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sender) {
      whereConditions.push('sender = ?');
      params.push(sender);
    }

    if (startDate) {
      whereConditions.push('date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('date <= ?');
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get messages with filters
    const messagesQuery = `
      SELECT * FROM messages 
      ${whereClause}
      ORDER BY date_time DESC 
      LIMIT ? OFFSET ?
    `;
    
    const result = await db.prepare(messagesQuery)
      .bind(...params, limit, offset)
      .all();

    // Get total count with same filters
    const countQuery = `
      SELECT COUNT(*) as count FROM messages 
      ${whereClause}
    `;
    
    const countResult = await db.prepare(countQuery)
      .bind(...params)
      .first();

    const totalCount = countResult?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Transform messages to match your frontend interface
    const messages = (result.results || []).map((msg: any) => ({
      id: msg.id,
      date: msg.date,
      time: msg.time,
      date_time: msg.date_time,
      type: msg.type,
      sender: msg.sender,
      message: msg.message,
      attachment: msg.attachment,
      sentiment: msg.sentiment,
      sentiment_score: msg.sentiment_score,
      conflict_detected: !!msg.conflict_detected, // Convert to boolean
      emotional_score: msg.emotional_score,
      tags_json: msg.tags_json,
      relationship_id: msg.relationship_id
    }));

    return new Response(
      JSON.stringify({
        messages,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNextPage: page < totalPages, // ← Fixed property name
          hasPrevPage: page > 1          // ← Fixed property name
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
    console.error('Messages API Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch messages',
        message: error instanceof Error ? error.message : 'Unknown error',
        messages: [],
        pagination: {
          page: 1,
          limit: 100,
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