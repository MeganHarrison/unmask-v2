// app/api/relationship-tracker/route.ts - REAL DATABASE VERSION
import { NextRequest, NextResponse } from 'next/server';

// Define the interface for relationship tracker data
interface RelationshipTrackerRow {
  id: number;
  date: string;
  scale: number;
  notes?: string;
}

interface ChartDataPoint {
  month: string;
  scale: number;
  notes?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get your Cloudflare credentials
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const databaseId = 'f450193b-9536-4ada-8271-2a8cd917069e';

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { success: false, error: 'Missing Cloudflare credentials - check your .env.local file' },
        { status: 500 }
      );
    }

    console.log('Querying D1 database for relationship_tracker data...');

    // Query the relationship_tracker table
    const query = `
      SELECT 
        id,
        date,
        scale,
        notes
      FROM relationship_tracker 
      ORDER BY date ASC
    `;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: query,
          params: []
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('D1 API error:', errorText);
      return NextResponse.json(
        { success: false, error: `Failed to query database: ${response.status} ${response.statusText}` },
        { status: 500 }
      );
    }

    const result = await response.json() as { success: boolean; result?: any[]; errors?: Array<{ message: string }> };
    
    if (!result.success) {
      console.error('D1 query failed:', result);
      return NextResponse.json(
        { success: false, error: `Database query failed: ${result.errors?.[0]?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const rows: RelationshipTrackerRow[] = result.result?.[0]?.results || [];
    console.log(`Found ${rows.length} rows in relationship_tracker table`);

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        metadata: {
          totalEntries: 0,
          monthsTracked: 0,
          dateRange: { start: null, end: null }
        }
      });
    }

    // Transform the data for the chart
    // Group by month and calculate average scale for each month
    const monthlyData = new Map<string, { scales: number[]; notes: string[] }>();

    rows.forEach(row => {
      const date = new Date(row.date);
      const monthKey = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { scales: [], notes: [] });
      }

      const monthData = monthlyData.get(monthKey)!;
      monthData.scales.push(row.scale);
      if (row.notes) {
        monthData.notes.push(row.notes);
      }
    });

    // Convert to chart format
    const chartData: ChartDataPoint[] = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        scale: Math.round((data.scales.reduce((sum, scale) => sum + scale, 0) / data.scales.length) * 10) / 10,
        notes: data.notes.length > 0 ? data.notes.join('; ') : undefined
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    console.log(`Returning ${chartData.length} monthly data points`);

    return NextResponse.json({
      success: true,
      data: chartData,
      metadata: {
        totalEntries: rows.length,
        monthsTracked: chartData.length,
        dateRange: {
          start: rows.length > 0 ? rows[0].date : null,
          end: rows.length > 0 ? rows[rows.length - 1].date : null
        }
      }
    });

  } catch (error) {
    console.error('Error fetching relationship tracker data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}