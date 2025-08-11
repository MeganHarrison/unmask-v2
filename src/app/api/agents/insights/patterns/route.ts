// app/api/insights/patterns/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Temporarily disable auth
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../../auth/route';

export async function GET(req: NextRequest) {
  try {
    // Temporarily disable auth
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    const analysisType = searchParams.get('type') || 'communication';

    // Call pattern analysis agent
    const patternResponse = await fetch(
      `https://unmask-pattern-agent.your-subdomain.workers.dev`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'default-user', // Temporarily hardcoded
          analysisType,
          timeframe,
          query: `Analyze ${analysisType} patterns over the last ${timeframe}`,
        }),
      }
    );

    if (!patternResponse.ok) {
      throw new Error('Pattern analysis failed');
    }

    const patterns = await patternResponse.json();
    
    return NextResponse.json({
      patterns: patterns.insights || [],
      timeframe,
      analysisType,
      confidence: patterns.confidence || 0.8,
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Patterns API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze patterns' }, 
      { status: 500 }
    );
  }
}