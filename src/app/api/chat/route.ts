// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

interface OrchestratorResponse {
  agentType: string;
  response: string;
  confidence: number;
  supportingData?: any;
  nextSteps?: string[];
  relatedInsights?: string[];
}

export async function POST(req: NextRequest) {
  try {
    // Temporarily disable auth for deployment
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { message, conversationHistory = [] }: ChatRequest = await req.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Call the orchestrator worker
    const orchestratorResponse = await fetch(
      `${process.env.CLOUDFLARE_WORKERS_URL}/orchestrator`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
        body: JSON.stringify({
          userId: 'default-user', // Temporarily hardcoded
          message,
          conversationHistory,
        }),
      }
    );

    if (!orchestratorResponse.ok) {
      throw new Error(`Orchestrator failed: ${orchestratorResponse.statusText}`);
    }

    const result: OrchestratorResponse = await orchestratorResponse.json();

    // Log the interaction for analytics
    // await logChatInteraction(session.user.id, message, result);

    return NextResponse.json({
      response: result.response,
      agentType: result.agentType,
      confidence: result.confidence,
      nextSteps: result.nextSteps || [],
      relatedInsights: result.relatedInsights || [],
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        response: "I'm having trouble processing your request right now. Could you try rephrasing your question?",
        agentType: 'error-fallback',
        confidence: 0.1
      }, 
      { status: 500 }
    );
  }
}

async function logChatInteraction(
  userId: string, 
  userMessage: string, 
  agentResponse: OrchestratorResponse
) {
  try {
    // This would typically go to your database
    // For now, we'll just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Chat Interaction:', {
        userId,
        userMessage: userMessage.substring(0, 100) + '...',
        agentType: agentResponse.agentType,
        confidence: agentResponse.confidence,
        timestamp: new Date().toISOString()
      });
    }
    
    // TODO: Implement proper logging to database
    // await logInteractionToDatabase(userId, userMessage, agentResponse);
  } catch (error) {
    console.error('Failed to log interaction:', error);
  }
}