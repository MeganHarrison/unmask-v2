import { NextRequest, NextResponse } from 'next/server'

const WORKER_URL = 'https://enhanced-relationship-intelligence-worker.megan-d14.workers.dev'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = searchParams.get('days') || '30'
    
    const response = await fetch(`${WORKER_URL}/api/dashboard?days=${days}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}