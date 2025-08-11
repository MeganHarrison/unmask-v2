import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import postgres from 'postgres';

export async function PUT(request: NextRequest) {
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

    if (!connectionString) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database connection not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { id, field, value } = body;

    if (!id || !field || value === undefined) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate allowed fields
    const allowedFields = ['sentiment', 'category', 'tag', 'conflict_detected'];
    if (!allowedFields.includes(field)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid field'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create database connection using Hyperdrive
    const sql = postgres(connectionString);

    try {
      // Build dynamic update query based on field
      let result;
      if (field === 'conflict_detected') {
        // Handle boolean field
        const boolValue = value === 'true' || value === true;
        result = await sql`
          UPDATE "texts-bc" 
          SET ${sql(field)} = ${boolValue}
          WHERE id = ${id}
          RETURNING *
        `;
      } else {
        // Handle string fields
        result = await sql`
          UPDATE "texts-bc" 
          SET ${sql(field)} = ${value}
          WHERE id = ${id}
          RETURNING *
        `;
      }

      if (!result || result.length === 0) {
        await sql.end();
        return new Response(JSON.stringify({
          success: false,
          error: 'Record not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Clean up the connection before returning
      await sql.end();
      
      return new Response(JSON.stringify({
        success: true,
        data: result[0]
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
    console.error('Error updating texts data via Hyperdrive:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update message'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}