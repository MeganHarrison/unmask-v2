// app/api/insights/timeline/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Temporarily disable auth for deployment
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // Call memory agent for timeline data
    const timelineResponse = await fetch(
      `https://unmask-memory-agent.your-subdomain.workers.dev`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'default-user', // Temporarily hardcoded
          queryType: 'timeline',
          startDate,
          endDate,
          includeMetrics: true,
        }),
      }
    );

    if (!timelineResponse.ok) {
      throw new Error('Timeline retrieval failed');
    }

    const timeline = await timelineResponse.json();
    
    return NextResponse.json({
      events: timeline.events || [],
      metrics: timeline.metrics || {},
      insights: timeline.insights || [],
      dateRange: { start: startDate, end: endDate },
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Timeline API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve timeline' }, 
      { status: 500 }
    );
  }
}