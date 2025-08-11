// src/app/api/texts-bc/route.ts - Enhanced version with proper filtering
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface TextMessage {
  id: number;
  date_time: string;
  date: string;
  time: string;
  sender: string;
  message: string;
  sentiment: string;
  category: string;
  tag: string;
  conflict_detected: boolean;
  sentiment_score: number;
}

interface FilterOptions {
  years: string[];
  senders: string[];
  categories: string[];
  tags: string[];
  sentiments: string[];
}

interface ApiResponse {
  success: boolean;
  data?: TextMessage[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters?: FilterOptions;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB;

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available',
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
      });
    }

    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Filter parameters
    const search = searchParams.get('search') || '';
    const sender = searchParams.get('sender') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const sentiment = searchParams.get('sentiment') || '';
    const year = searchParams.get('year') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const conflictFilter = searchParams.get('conflictFilter') || '';

    // Build dynamic WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];

    // Search in message content
    if (search) {
      conditions.push('(message LIKE ? OR sender LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    // Filter by sender
    if (sender) {
      conditions.push('sender = ?');
      params.push(sender);
    }

    // Filter by category
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    // Filter by tag
    if (tag) {
      conditions.push('tag = ?');
      params.push(tag);
    }

    // Filter by sentiment
    if (sentiment) {
      conditions.push('sentiment = ?');
      params.push(sentiment);
    }

    // Filter by year
    if (year) {
      conditions.push("strftime('%Y', date_time) = ?");
      params.push(year);
    }

    // Filter by date range
    if (startDate) {
      conditions.push('DATE(date_time) >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('DATE(date_time) <= ?');
      params.push(endDate);
    }

    // Filter by conflict detection
    if (conflictFilter === 'conflicts') {
      conditions.push('conflict_detected = 1');
    } else if (conflictFilter === 'peaceful') {
      conditions.push('conflict_detected = 0');
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Get total count with filters
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM "texts-bc" 
      ${whereClause}
    `;
    
    const countResult = await db.prepare(countQuery).bind(...params).first() as { total: number };
    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Get filtered data with pagination
    const dataQuery = `
      SELECT 
        id,
        date_time,
        date,
        time,
        sender,
        message,
        sentiment,
        category,
        tag,
        conflict_detected,
        sentiment_score
      FROM "texts-bc" 
      ${whereClause}
      ORDER BY date_time DESC 
      LIMIT ? OFFSET ?
    `;

    const dataResult = await db.prepare(dataQuery)
      .bind(...params, limit, offset)
      .all() as { results: TextMessage[] };

    const messages = dataResult.results || [];

    // Calculate pagination info
    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return NextResponse.json({
      success: true,
      data: messages,
      pagination
    });

  } catch (error) {
    console.error('Texts API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    }, { status: 500 });
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