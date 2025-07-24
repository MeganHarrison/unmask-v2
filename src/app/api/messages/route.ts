import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface Message {
  id: number;
  date_time: string;
  date: string;
  time: string;
  type: 'Incoming' | 'Outgoing';
  sender: string;
  message: string;
  attachment: string;
  tag: string;
  sentiment: string;
  category: string;
  vector_embedding?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const sender = searchParams.get('sender') || '';
    const offset = (page - 1) * limit;

    const db = env.DB;
    
    if (!db) {
      throw new Error('Database connection not available. Check D1 bindings in wrangler.toml');
    }

    let messages: Message[] = [];
    let totalCount = 0;

    if (search) {
      // Traditional text search
      const query = `
        SELECT * FROM "texts-bc" 
        WHERE (message LIKE ? OR sender LIKE ?) 
        ORDER BY date_time DESC 
        LIMIT ? OFFSET ?
      `;
      const params = [`%${search}%`, `%${search}%`, limit, offset];
      
      const result = await db.prepare(query).bind(...params).all();
      messages = (result.results as unknown) as Message[];
      
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as count FROM "texts-bc" 
        WHERE (message LIKE ? OR sender LIKE ?)
      `;
      const countResult = await db.prepare(countQuery).bind(`%${search}%`, `%${search}%`).first();
      totalCount = Number(countResult?.count || 0);
    } else if (sender && sender !== 'all') {
      // Filter by sender
      const query = `
        SELECT * FROM "texts-bc" 
        WHERE sender = ? 
        ORDER BY date_time DESC 
        LIMIT ? OFFSET ?
      `;
      
      const result = await db.prepare(query).bind(sender, limit, offset).all();
      messages = (result.results as unknown) as Message[];
      
      // Get total count
      const countResult = await db.prepare('SELECT COUNT(*) as count FROM "texts-bc" WHERE sender = ?').bind(sender).first();
      totalCount = Number(countResult?.count || 0);
    } else {
      // Get all messages with pagination
      const query = `
        SELECT * FROM "texts-bc" 
        ORDER BY date_time DESC 
        LIMIT ? OFFSET ?
      `;
      
      const result = await db.prepare(query).bind(limit, offset).all();
      messages = (result.results as unknown) as Message[];
      
      // Get total count
      const countResult = await db.prepare('SELECT COUNT(*) as count FROM "texts-bc"').first();
      totalCount = Number(countResult?.count || 0);
    }

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: offset + limit < totalCount,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Messages API Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch messages',
        message: error instanceof Error ? error.message : 'Unknown error',
        messages: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      },
      { status: 500 }
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