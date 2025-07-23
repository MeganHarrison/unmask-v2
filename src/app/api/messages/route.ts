import { NextRequest, NextResponse } from 'next/server';

// Mock data for local development
const generateMockMessages = (page: number, limit: number, sender?: string, search?: string) => {
  const messages = [];
  const start = (page - 1) * limit;
  
  for (let i = 0; i < limit; i++) {
    const index = start + i;
    const senderName = index % 2 === 0 ? 'Brandon' : 'You';
    
    // Filter by sender if specified
    if (sender && senderName !== sender) continue;
    
    const message = {
      id: index + 1,
      date: '2025-01-01',
      time: `${(index % 24).toString().padStart(2, '0')}:00:00`,
      date_time: `2025-01-01 ${(index % 24).toString().padStart(2, '0')}:00:00`,
      type: senderName === 'Brandon' ? 'Incoming' : 'Outgoing',
      sender: senderName,
      message: `Test message ${index + 1} - This is a sample message for testing`,
      attachment: null,
      sentiment: null,
      sentiment_score: Math.random() * 2 - 1, // Random sentiment between -1 and 1
      conflict_detected: Math.random() > 0.9, // 10% chance of conflict
      emotional_score: Math.random(),
      tags_json: null,
      relationship_id: 1
    };
    
    // Filter by search if specified
    if (search && !message.message.toLowerCase().includes(search.toLowerCase())) continue;
    
    messages.push(message);
  }
  
  return messages;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const sender = searchParams.get('sender') || '';
    
    // Generate mock messages
    const allMessages = generateMockMessages(page, limit, sender, search);
    const total = 27689; // Mock total count
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      messages: allMessages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}