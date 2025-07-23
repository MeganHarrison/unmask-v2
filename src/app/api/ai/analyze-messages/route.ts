import { NextRequest, NextResponse } from 'next/server';

// Mock AI analysis for local development
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'AI analysis is only available in production with OpenAI API key',
      analyzed: 0,
      total: 0
    });
  } catch (error) {
    console.error('Error in message analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze messages' },
      { status: 500 }
    );
  }
}

// GET endpoint to check analysis progress
export async function GET(request: NextRequest) {
  try {
    // Return mock progress for local development
    return NextResponse.json({
      total: 27689,
      analyzed: 0,
      unanalyzed: 27689,
      percentage: 0
    });
  } catch (error) {
    console.error('Error checking analysis progress:', error);
    return NextResponse.json(
      { error: 'Failed to check progress' },
      { status: 500 }
    );
  }
}