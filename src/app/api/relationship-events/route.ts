import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET(request: Request) {
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

    // Create a database client
    const sql = postgres(connectionString);

    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    try {
      // Get total count
      const countResult = await sql`
        SELECT COUNT(*) as count 
        FROM relationship_events
      `;
      const total = parseInt(countResult[0].count);

      // Query the relationship_events table from Supabase via Hyperdrive
      // First, let's check what columns actually exist
      const result = await sql`
        SELECT *
        FROM relationship_events
        ORDER BY id DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      // Log the first row to see the actual columns
      if (result.length > 0) {
        console.log('Sample relationship_events row:', Object.keys(result[0]));
      }

      // Clean up the connection
      await sql.end();

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        success: true,
        data: result,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
      
    } catch (queryError) {
      // Make sure to close the connection on error
      await sql.end();
      throw queryError;
    }

  } catch (error) {
    console.error('Error fetching relationship events:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch relationship events'
    }, { status: 500 });
  }
}

// Update endpoint for inline editing
export async function PUT(request: Request) {
  try {
    let connectionString: string;
    
    // Get connection string (same as GET)
    try {
      const { env } = await getCloudflareContext();
      
      if (env.HYPERDRIVE && env.HYPERDRIVE.connectionString) {
        connectionString = env.HYPERDRIVE.connectionString;
      } else {
        connectionString = process.env.HYPERDRIVE_LOCAL_CONNECTION_STRING || 
          'postgresql://postgres.dsnsuagkzkuzzjwvuomi:LqRmThEbXpZyWnVb@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
      }
    } catch (error) {
      connectionString = process.env.HYPERDRIVE_LOCAL_CONNECTION_STRING || 
        'postgresql://postgres.dsnsuagkzkuzzjwvuomi:LqRmThEbXpZyWnVb@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
    }

    const sql = postgres(connectionString);
    const body = await request.json() as { id: number; field: string; value: string };
    const { id, field, value } = body;

    try {
      // Update the specific field
      let query;
      switch(field) {
        case 'name':
        case 'category':
        case 'notes':
          query = sql`
            UPDATE relationship_events 
            SET ${sql(field)} = ${value}
            WHERE id = ${id}
          `;
          break;
        case 'rating':
          // Ensure it's a number between 0 and 5
          const rating = Math.max(0, Math.min(5, parseInt(value)));
          query = sql`
            UPDATE relationship_events 
            SET rating = ${rating}
            WHERE id = ${id}
          `;
          break;
        default:
          throw new Error(`Field ${field} cannot be updated`);
      }

      await query;
      await sql.end();

      return NextResponse.json({
        success: true,
        message: 'Event updated successfully'
      });

    } catch (queryError) {
      await sql.end();
      throw queryError;
    }

  } catch (error) {
    console.error('Error updating relationship event:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update event'
    }, { status: 500 });
  }
}