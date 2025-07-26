import { NextRequest, NextResponse } from 'next/server';

/**
 * Dynamic API route for fetching chart data from various D1 datasets
 * 
 * Usage: GET /api/d1/[dataset]
 * 
 * Supported datasets:
 * - relationship-tracker: Connection scores over time
 * - texts-bc: Text messages with sentiment analysis
 * - daily-tracker: Daily connection tracking
 * - journal-entries: Journal entries with mood scores
 * - connection-levels: Monthly connection level tracking
 * - conversation-chunks: Conversation analysis data
 * 
 * Example: GET /api/d1/relationship-tracker
 */

// Generic interface for data rows
interface DataRow {
  id: number;
  date: string;
  [key: string]: any; // Dynamic fields based on dataset
}

interface ChartDataPoint {
  [key: string]: string | number | any; // Dynamic keys for chart data
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dataset: string }> }
) {
  try {
    const { dataset } = await params;
    console.log('Fetching data for dataset:', dataset);

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;

    if (!accountId || !apiToken || !databaseId) {
      return NextResponse.json(
        { success: false, error: 'Missing Cloudflare credentials' },
        { status: 500 }
      );
    }

    // Map dataset parameter to actual table names and queries
    let query: string;
    let xAxisKey: string;
    let yAxisKey: string;
    let valueField: string;
    let metadataField: string | null = null;

    switch (dataset) {
      case 'relationship-tracker':
        query = `
          SELECT 
            id,
            date,
            connection_score as value,
            notes as metadata
          FROM "relationship-tracker"
          ORDER BY date ASC
        `;
        xAxisKey = 'date';
        yAxisKey = 'connectionScore';
        valueField = 'value';
        metadataField = 'metadata';
        break;
      
      case 'texts-bc':
        query = `
          SELECT 
            id,
            timestamp as date,
            sentiment_score as value,
            message as metadata
          FROM "texts-bc"
          ORDER BY timestamp ASC
        `;
        xAxisKey = 'date';
        yAxisKey = 'sentimentScore';
        valueField = 'value';
        metadataField = 'metadata';
        break;
      
      case 'daily-tracker':
        query = `
          SELECT 
            id,
            date,
            connection_felt as value,
            notes as metadata
          FROM "daily_tracker"
          ORDER BY date ASC
        `;
        xAxisKey = 'date';
        yAxisKey = 'connectionLevel';
        valueField = 'value';
        metadataField = 'metadata';
        break;
      
      case 'journal-entries':
        query = `
          SELECT 
            id,
            created_at as date,
            mood_score as value,
            entry as metadata
          FROM "journal_entries"
          ORDER BY created_at ASC
        `;
        xAxisKey = 'date';
        yAxisKey = 'moodScore';
        valueField = 'value';
        metadataField = 'metadata';
        break;
      
      case 'connection-levels':
        query = `
          SELECT 
            id,
            month as date,
            connection_score as value,
            notes as metadata
          FROM "connection_levels"
          ORDER BY month ASC
        `;
        xAxisKey = 'month';
        yAxisKey = 'connectionScore';
        valueField = 'value';
        metadataField = 'metadata';
        break;
      
      case 'conversation-chunks':
        query = `
          SELECT 
            id,
            created_at as date,
            sentiment_score as value,
            chunk_text as metadata
          FROM "conversation_chunks"
          ORDER BY created_at ASC
        `;
        xAxisKey = 'date';
        yAxisKey = 'sentimentScore';
        valueField = 'value';
        metadataField = 'metadata';
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: `Unknown dataset: ${dataset}` },
          { status: 404 }
        );
    }

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
        { success: false, error: 'Failed to query database' },
        { status: 500 }
      );
    }

    const result = await response.json() as {
      success: boolean;
      result?: Array<{
        results: DataRow[];
      }>;
      error?: string;
    };
    
    if (!result.success) {
      console.error('D1 query failed:', result);
      return NextResponse.json(
        { success: false, error: 'Database query failed' },
        { status: 500 }
      );
    }

    const rows: DataRow[] = result.result?.[0]?.results || [];

    // CUSTOMIZE THIS AGGREGATION for your data type
    const groupedData = new Map<string, { values: number[]; metadata: any[] }>();

    rows.forEach(row => {
      const date = new Date(row.date);
      
      // Group by month for most datasets
      const groupKey = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short'
      });

      if (!groupedData.has(groupKey)) {
        groupedData.set(groupKey, { values: [], metadata: [] });
      }

      const groupData = groupedData.get(groupKey)!;
      
      // Use the dynamic valueField from the switch statement
      if (row[valueField] !== undefined && row[valueField] !== null) {
        groupData.values.push(Number(row[valueField]));
      }
      
      // Use the dynamic metadataField if it exists
      if (metadataField && row[metadataField]) {
        groupData.metadata.push(row[metadataField]);
      }
    });

    // Convert to chart format using the dynamic axis keys
    
    const chartData: ChartDataPoint[] = Array.from(groupedData.entries())
      .map(([groupKey, data]) => ({
        [xAxisKey]: groupKey,
        [yAxisKey]: Math.round((data.values.reduce((sum, val) => sum + val, 0) / data.values.length) * 10) / 10, // CUSTOMIZE: aggregation method
        metadata: data.metadata.length > 0 ? data.metadata.join('; ') : undefined
      }))
      .sort((a, b) => new Date(a[xAxisKey] as string).getTime() - new Date(b[xAxisKey] as string).getTime());

    return NextResponse.json({
      success: true,
      data: chartData,
      metadata: {
        totalEntries: rows.length,
        groupsTracked: chartData.length,
        dateRange: {
          start: rows.length > 0 ? rows[0].date : null,
          end: rows.length > 0 ? rows[rows.length - 1].date : null
        }
      }
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}