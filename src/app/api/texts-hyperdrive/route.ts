import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import postgres from 'postgres';

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
    let connectionString: string;
    
    // Try to get Cloudflare context (production)
    try {
      const { env } = await getCloudflareContext();
      
      if (env.HYPERDRIVE && env.HYPERDRIVE.connectionString) {
        connectionString = env.HYPERDRIVE.connectionString;
      } else {
        // Fallback to local connection string from wrangler.jsonc for development
        connectionString = process.env.HYPERDRIVE_LOCAL_CONNECTION_STRING || 
          'postgresql://postgres.dsnsuagkzkuzzjwvuomi:LqRmThEbXpZyWnVb@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
      }
    } catch (error) {
      // In development, getCloudflareContext might not work
      connectionString = process.env.HYPERDRIVE_LOCAL_CONNECTION_STRING || 
        'postgresql://postgres.dsnsuagkzkuzzjwvuomi:LqRmThEbXpZyWnVb@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
    }

    // For local development, return mock data if no connection string
    if (!connectionString) {
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

    // Create database connection using Hyperdrive
    const sql = postgres(connectionString);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    try {
      let messages: TextMessage[];
      let total: number;

      if (startDate && endDate) {
        // Query with date range
        const [messagesResult, countResult] = await Promise.all([
          sql`
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
            WHERE date_time >= ${startDate} AND date_time <= ${endDate}
            ORDER BY date_time DESC 
            LIMIT ${limit} OFFSET ${offset}
          `,
          sql`
            SELECT COUNT(*) as total 
            FROM "texts-bc" 
            WHERE date_time >= ${startDate} AND date_time <= ${endDate}
          `
        ]);
        
        messages = messagesResult as TextMessage[];
        total = Number(countResult[0].total);
      } else {
        // Query without date range
        const [messagesResult, countResult] = await Promise.all([
          sql`
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
            ORDER BY date_time DESC 
            LIMIT ${limit} OFFSET ${offset}
          `,
          sql`
            SELECT COUNT(*) as total FROM "texts-bc"
          `
        ]);
        
        messages = messagesResult as TextMessage[];
        total = Number(countResult[0].total);
      }

      // Clean up the connection before returning
      await sql.end();
      
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

    } catch (queryError) {
      // Make sure to close the connection on error
      await sql.end();
      throw queryError;
    }

  } catch (error) {
    console.error('Error fetching texts data via Hyperdrive:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch messages'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}