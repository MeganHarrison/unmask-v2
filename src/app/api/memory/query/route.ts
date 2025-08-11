// app/api/memory/query/route.ts - Memory agent API endpoint
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Temporarily disable auth for deployment
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const memoryRequest = await req.json();

    // Add userId to the request (using a default for now)
    const requestWithUser = {
      ...memoryRequest,
      userId: 'default-user'
    };

    // Forward to memory agent worker
    const workerResponse = await fetch(
      `https://unmask-memory-agent.your-subdomain.workers.dev`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestWithUser),
      }
    );

    if (!workerResponse.ok) {
      throw new Error(`Memory agent failed: ${workerResponse.statusText}`);
    }

    const result = await workerResponse.json();
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Memory API error:', error);
    return NextResponse.json(
      { error: 'Memory query failed' }, 
      { status: 500 }
    );
  }
}