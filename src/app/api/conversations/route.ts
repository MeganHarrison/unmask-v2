import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const db = env.DB;
    if (!db) {
      return NextResponse.json({ 
        error: 'Database not available',
        conversations: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
      });
    }

    // Get conversation chunks from the database
    const query = `
      SELECT * FROM conversation_chunks 
      ORDER BY start_time DESC 
      LIMIT ? OFFSET ?
    `;
    
    const result = await db.prepare(query).bind(limit, offset).all();
    const conversations = result.results || [];
    
    // Get total count
    const countResult = await db.prepare('SELECT COUNT(*) as count FROM conversation_chunks').first();
    const total = Number(countResult?.count || 0);
    
    return NextResponse.json({
      conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: offset + limit < total,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Conversations API Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch conversations',
      message: error instanceof Error ? error.message : 'Unknown error',
      conversations: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    }, { status: 500 });
  }
}