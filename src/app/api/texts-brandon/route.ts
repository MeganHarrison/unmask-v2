import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: NextRequest) {
  try {
    const context = getCloudflareContext();
    const db = context?.env?.DB;

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    // Extract query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');
    const relationshipId = searchParams.get('relationship_id');
    const sender = searchParams.get('sender');
    const startDate = searchParams.get('from');
    const endDate = searchParams.get('to');
    const search = searchParams.get('search');

    // Build dynamic query with filters
    let query = `
      SELECT 
        id,
        date_time,
        sender,
        message,
        category,
        tag,
        sentiment,
        sentiment_score,
        conflict_detected
      FROM "texts-bc"
      WHERE 1=1
    `;

    const params: any[] = [];

    // Add filters
    if (relationshipId) {
      query += ` AND relationship_id = ?`;
      params.push(parseInt(relationshipId));
    }

    if (sender) {
      query += ` AND sender = ?`;
      params.push(sender);
    }

    if (startDate) {
      query += ` AND DATE(date_time) >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND DATE(date_time) <= ?`;
      params.push(endDate);
    }

    if (search) {
      query += ` AND message LIKE ?`;
      params.push(`%${search}%`);
    }

    // Add ordering and pagination
    query += ` ORDER BY date_time DESC`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute query
    const result = await db.prepare(query).bind(...params).all();

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM "texts-bc" 
      WHERE 1=1
    `;
    
    const countParams: any[] = [];

    // Apply same filters to count query
    if (relationshipId) {
      countQuery += ` AND relationship_id = ?`;
      countParams.push(parseInt(relationshipId));
    }

    if (sender) {
      countQuery += ` AND sender = ?`;
      countParams.push(sender);
    }

    if (startDate) {
      countQuery += ` AND DATE(date_time) >= ?`;
      countParams.push(startDate);
    }

    if (endDate) {
      countQuery += ` AND DATE(date_time) <= ?`;
      countParams.push(endDate);
    }

    if (search) {
      countQuery += ` AND message LIKE ?`;
      countParams.push(`%${search}%`);
    }

    const countResult = await db.prepare(countQuery).bind(...countParams).first() as { total: number };

    return NextResponse.json({
      data: result.results,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset,
        hasMore: offset + limit < (countResult?.total || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching texts_brandon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}