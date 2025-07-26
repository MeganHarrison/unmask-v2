import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the relationship-tracker API
    const response = await fetch('http://localhost:3000/api/relationship-tracker');
    const data = await response.json() as { success: boolean; data?: any[]; error?: string };
    
    return NextResponse.json({
      status: 'Debug endpoint working',
      apiResponse: {
        success: data.success,
        dataLength: data.data?.length || 0,
        error: data.error || null,
        sampleData: data.data?.[0] || null
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'Debug endpoint error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}