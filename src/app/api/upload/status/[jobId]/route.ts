// app/api/upload/status/[jobId]/route.ts - Job status checking
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    // Temporarily disable auth for deployment
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { jobId } = params;

    // Check job status with the worker
    const workerResponse = await fetch(
      `https://unmask-data-ingestion.your-subdomain.workers.dev/status/${jobId}`
    );

    if (!workerResponse.ok) {
      if (workerResponse.status === 404) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      throw new Error(`Worker responded with ${workerResponse.status}`);
    }

    const job = await workerResponse.json();
    
    // Security check: ensure this job belongs to the current user
    if (job.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      steps: job.steps,
      results: job.results,
      error: job.error,
      updatedAt: job.updatedAt
    });

  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: 'Status check failed' }, 
      { status: 500 }
    );
  }
}