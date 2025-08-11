import { NextRequest, NextResponse } from 'next/server'

const WORKER_URL = 'https://enhanced-relationship-intelligence-worker.megan-d14.workers.dev'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${WORKER_URL}/api/daily-context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Daily context error:', error)
    return NextResponse.json(
      { error: 'Failed to save daily context' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    const response = await fetch(`${WORKER_URL}/api/daily-context?date=${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Get context error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily context' },
      { status: 500 }
    )
  }
}