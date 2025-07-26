import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET() {
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

    try {
      // Query the relationship_tracker table from Supabase via Hyperdrive
      // First, let's check what columns actually exist
      const result = await sql`
        SELECT *
        FROM relationship_tracker
        ORDER BY date DESC
        LIMIT 100
      `;

      // Log the first row to see the actual columns
      if (result.length > 0) {
        console.log('Sample row columns:', Object.keys(result[0]));
      }

      // Transform data for chart display - adapt to actual columns
      const chartData = result.map((row: any) => {
        // Try different date column names
        const dateValue = row.date || row.created_at || row.timestamp || new Date();
        const date = new Date(dateValue);
        
        return {
          date: date.toISOString().split('T')[0], // YYYY-MM-DD format
          month: date.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
          scale: row.scale || row.health_score || row.connection_score || row.value || 5,
          notes: row.notes || row.description || '',
          id: row.id,
          name: row.name || '',
          partner_name: row.partner_name || '',
          status: row.status || 'active',
          interaction_count: row.interaction_count || 0
        };
      });

      // Group by month and calculate average health scores
      const monthlyData = chartData.reduce((acc: any, item: any) => {
        const monthKey = item.month;
        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthKey,
            scale: item.scale,
            count: 1,
            notes: [item.notes].filter(Boolean),
            interaction_count: item.interaction_count
          };
        } else {
          acc[monthKey].scale += item.scale;
          acc[monthKey].count += 1;
          acc[monthKey].interaction_count += item.interaction_count;
          if (item.notes) acc[monthKey].notes.push(item.notes);
        }
        return acc;
      }, {});

      // Calculate averages and format for chart
      const finalData = Object.values(monthlyData)
        .map((item: any) => ({
          month: item.month,
          scale: Math.round((item.scale / item.count) * 10) / 10, // Round to 1 decimal
          notes: item.notes.join('; '),
          avgInteractions: Math.round(item.interaction_count / item.count)
        }))
        .sort((a, b) => {
          // Sort by date (parse month strings back to dates for proper sorting)
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA.getTime() - dateB.getTime();
        });

      // Clean up the connection
      await sql.end();

      return NextResponse.json({
        success: true,
        data: finalData,
        rawData: chartData,
        total: result.length
      });
      
    } catch (queryError) {
      // Make sure to close the connection on error
      await sql.end();
      throw queryError;
    }

  } catch (error) {
    console.error('Error fetching relationship tracker data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch relationship data'
    }, { status: 500 });
  }
}