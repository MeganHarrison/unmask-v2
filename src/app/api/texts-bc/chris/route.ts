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
    const context = await getCloudflareContext();
    const db = context?.env?.DB;

    if (!db) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database connection not available'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Query for messages with Chris tag (case-insensitive)
    const query = `
      WITH RankedMessages AS (
        SELECT 
          id,
          date_time,
          sender,
          message,
          sentiment,
          category,
          tag,
          conflict_detected,
          ROW_NUMBER() OVER (
            PARTITION BY date_time, TRIM(message) 
            ORDER BY id
          ) as rn
        FROM "texts-bc" 
        WHERE LOWER(tag) = 'chris'
      )
      SELECT 
        id,
        date_time,
        sender,
        message,
        sentiment,
        category,
        tag,
        conflict_detected
      FROM RankedMessages
      WHERE rn = 1
      ORDER BY date_time ASC 
      LIMIT ? OFFSET ?
    `;

    // Count unique Chris-tagged messages
    const countQuery = `
      WITH UniqueMessages AS (
        SELECT DISTINCT date_time, TRIM(message) as message
        FROM "texts-bc" 
        WHERE LOWER(tag) = 'chris'
      )
      SELECT COUNT(*) as total FROM UniqueMessages
    `;

    const [results, countResult] = await Promise.all([
      db.prepare(query).bind(limit, offset).all(),
      db.prepare(countQuery).first()
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
    console.error('Error fetching Chris messages:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch Chris messages'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}