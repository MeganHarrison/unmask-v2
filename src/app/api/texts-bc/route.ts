import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface TextMessage {
  id: number;
  date_time: string;
  sender: string;
  message: string;
  sentiment: string;
  category: string;
  tag: string;
  conflict_detected: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const context = getCloudflareContext();
    const db = context?.env?.DB;

    if (!db) {
      // Return mock data for development/testing
      const mockData = [
        {
          id: 1,
          date_time: new Date().toISOString(),
          sender: "Alice",
          message: "Hey, how are you doing today?",
          sentiment: "positive",
          category: "greeting",
          tag: "casual",
          conflict_detected: false
        },
        {
          id: 2,
          date_time: new Date(Date.now() - 3600000).toISOString(),
          sender: "Bob",
          message: "I'm feeling a bit stressed about work",
          sentiment: "negative",
          category: "emotional",
          tag: "work",
          conflict_detected: false
        },
        {
          id: 3,
          date_time: new Date(Date.now() - 7200000).toISOString(),
          sender: "Alice",
          message: "We need to talk about what happened yesterday",
          sentiment: "neutral",
          category: "relationship",
          tag: "serious",
          conflict_detected: true
        }
      ];

      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');

      return new Response(JSON.stringify({
        success: true,
        data: mockData,
        pagination: {
          page,
          limit,
          total: mockData.length,
          totalPages: 1
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    let whereClause = '';
    const queryParams: any[] = [];
    
    if (startDate && endDate) {
      whereClause = 'WHERE date_time >= ? AND date_time <= ?';
      queryParams.push(startDate, endDate);
    }

    const query = `
      SELECT 
        id,
        date_time,
        sender,
        message,
        sentiment,
        category,
        tag,
        conflict_detected
      FROM "texts-bc" 
      ${whereClause}
      ORDER BY date_time DESC 
      LIMIT ? OFFSET ?
    `;

    const countQuery = `SELECT COUNT(*) as total FROM "texts-bc" ${whereClause}`;

    // Add limit and offset to query params
    queryParams.push(limit, offset);

    const [results, countResult] = await Promise.all([
      db.prepare(query).bind(...queryParams).all(),
      db.prepare(countQuery).bind(...(whereClause ? [startDate, endDate] : [])).first()
    ]);

    const messages = results.results as unknown as TextMessage[];
    const total = (countResult as any)?.total || 0;

    return new Response(JSON.stringify({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching texts-bc data:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch messages'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}