import { NextRequest, NextResponse } from 'next/server';

// Mock insights data for local development
const generateMockInsights = () => {
  const today = new Date();
  const byDate = [];
  
  // Generate last 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    byDate.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 10
    });
  }

  // Generate last 12 months of data
  const byMonth = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    byMonth.push({
      month: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
      count: Math.floor(Math.random() * 1000) + 500
    });
  }

  return {
    total: 27689,
    bySender: [
      { sender: 'You', count: 13115 },
      { sender: 'Brandon', count: 14574 }
    ],
    byDate,
    byMonth,
    sentimentOverview: {
      positive: 15234,
      negative: 3456,
      neutral: 8999,
      unanalyzed: 0
    },
    conflictCount: 234,
    averageMessagesPerDay: 32,
    longestStreak: 180,
    currentStreak: 45
  };
};

export async function GET(request: NextRequest) {
  try {
    const stats = generateMockInsights();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}