
// app/api/insights/health-score/route.ts
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

    // Call emotional agent for health assessment
    const healthResponse = await fetch(
      `https://unmask-emotional-agent.your-subdomain.workers.dev`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'default-user', // Temporarily hardcoded
          analysisType: 'health_assessment',
          includeBreakdown: true,
        }),
      }
    );

    if (!healthResponse.ok) {
      throw new Error('Health assessment failed');
    }

    const health = await healthResponse.json();
    
    return NextResponse.json({
      currentScore: health.healthScore || 7.5,
      breakdown: health.breakdown || {},
      trend: health.trend || 'stable',
      recommendations: health.recommendations || [],
      lastCalculated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Health score API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate health score' }, 
      { status: 500 }
    );
  }
}