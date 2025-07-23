// app/api/dashboard/stats/route.ts
// Replace hardcoded stats with real D1 data

export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: NextRequest) {
  try {
    // Get the Cloudflare context to access bindings
    const { env } = getCloudflareContext();
    const db = env.DB;
    
    if (!db) {
      throw new Error('Database connection not available');
    }

    // Get real message count
    const totalMessagesResult = await db.prepare(
      'SELECT COUNT(*) as count FROM messages'
    ).first();
    const totalMessages = totalMessagesResult?.count || 0;

    // Get date range
    const dateRangeResult = await db.prepare(`
      SELECT 
        MIN(date_time) as earliest,
        MAX(date_time) as latest
      FROM messages
    `).first();

    // Calculate years of data
    const yearsOfData = dateRangeResult ? 
      calculateYearsFromDates(dateRangeResult.earliest, dateRangeResult.latest) : 0;

    // Get unique participants
    const participantsResult = await db.prepare(`
      SELECT DISTINCT sender FROM messages 
      WHERE sender IS NOT NULL AND sender != ''
      UNION 
      SELECT DISTINCT 'You' as sender FROM messages WHERE type = 'Outgoing'
    `).all();
    const participantCount = participantsResult.results?.length || 0;

    // Get recent activity for AI readiness indicator
    const recentActivityResult = await db.prepare(`
      SELECT COUNT(*) as count FROM messages 
      WHERE date_time >= datetime('now', '-30 days')
    `).first();
    const hasRecentActivity = (recentActivityResult?.count || 0) > 0;

    // Message frequency stats
    const messagesByMonthResult = await db.prepare(`
      SELECT 
        strftime('%Y-%m', date_time) as month,
        COUNT(*) as count
      FROM messages 
      GROUP BY strftime('%Y-%m', date_time)
      ORDER BY month DESC
      LIMIT 12
    `).all();

    // Communication patterns
    const communicationPatterns = await db.prepare(`
      SELECT 
        strftime('%H', date_time) as hour,
        COUNT(*) as count
      FROM messages 
      GROUP BY strftime('%H', date_time)
      ORDER BY count DESC
      LIMIT 1
    `).first();

    const mostActiveHour = communicationPatterns ? 
      `${communicationPatterns.hour}:00` : 'Unknown';

    return new Response(
      JSON.stringify({
        stats: {
          totalMessages: totalMessages.toLocaleString(),
          yearsOfData: yearsOfData.toFixed(1),
          participants: participantCount,
          aiReady: hasRecentActivity,
          lastUpdated: new Date().toISOString()
        },
        insights: {
          messagesByMonth: messagesByMonthResult.results || [],
          mostActiveHour,
          averagePerDay: Math.round(totalMessages / (yearsOfData * 365)),
          communicationHealth: calculateHealthScore(totalMessages, yearsOfData)
        },
        metadata: {
          databaseId: 'f450193b-9536-4ada-8271-2a8cd917069e',
          dataSource: 'live',
          vectorized: true
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      }
    );

  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    // Return safe fallback data
    return new Response(
      JSON.stringify({
        stats: {
          totalMessages: '0',
          yearsOfData: '0',
          participants: 0,
          aiReady: false,
          lastUpdated: new Date().toISOString()
        },
        insights: {
          messagesByMonth: [],
          mostActiveHour: 'Unknown',
          averagePerDay: 0,
          communicationHealth: 0
        },
        metadata: {
          databaseId: 'f450193b-9536-4ada-8271-2a8cd917069e',
          dataSource: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

function calculateYearsFromDates(earliest: string, latest: string): number {
  if (!earliest || !latest) return 0;
  
  const start = new Date(earliest);
  const end = new Date(latest);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
  
  return Math.max(0.1, diffYears); // Minimum 0.1 years
}

function calculateHealthScore(totalMessages: number, yearsOfData: number): number {
  if (yearsOfData === 0) return 0;
  
  const messagesPerYear = totalMessages / yearsOfData;
  
  // Score based on communication frequency
  // 0-1000 msgs/year = 1-3 score
  // 1000-5000 msgs/year = 3-7 score  
  // 5000+ msgs/year = 7-10 score
  
  if (messagesPerYear < 1000) return Math.min(3, messagesPerYear / 333);
  if (messagesPerYear < 5000) return 3 + ((messagesPerYear - 1000) / 1000);
  return Math.min(10, 7 + ((messagesPerYear - 5000) / 2500));
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}