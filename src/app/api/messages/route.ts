import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const sender = searchParams.get('sender') || '';
    
    // Get the Cloudflare context and D1 database
    const { env } = getRequestContext();
    const db = env.DB;
    
    // Build the query
    let query = 'SELECT * FROM "texts-bc" WHERE 1=1';
    const params: any[] = [];
    
    if (sender && sender !== 'all') {
      query += ' AND sender = ?';
      params.push(sender);
    }
    
    if (search) {
      query += ' AND message LIKE ?';
      params.push(`%${search}%`);
    }
    
    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResult = await db.prepare(countQuery).bind(...params).first();
    const total = Number(countResult?.count || 0);
    
    // Add pagination
    query += ' ORDER BY date_time DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);
    
    // Execute query
    const result = await db.prepare(query).bind(...params).all();
    const messages = result.results || [];
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    
    // Fallback for local development
    if (error instanceof Error && error.message.includes('getRequestContext')) {
      return NextResponse.json({
        messages: [],
        pagination: {
          page: 1,
          limit: 100,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        error: 'Database not available in local development'
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}