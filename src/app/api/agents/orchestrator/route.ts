// app/api/agents/orchestrator/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Forward to Cloudflare Worker
    const workerResponse = await fetch(
      `https://unmask-orchestrator.your-subdomain.workers.dev`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!workerResponse.ok) {
      throw new Error(`Worker responded with ${workerResponse.status}`);
    }

    const result = await workerResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Orchestrator API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}