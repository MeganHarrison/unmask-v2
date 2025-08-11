// components/debug/ChatDebugger.tsx - Add this to see what's happening
'use client';

import React, { useState } from 'react';
import { Eye, Code, AlertCircle, CheckCircle } from 'lucide-react';

interface DebugChatProps {
  onDebugMessage: (message: string) => Promise<any>;
}

export function ChatDebugger({ onDebugMessage }: DebugChatProps) {
  const [debugMessage, setDebugMessage] = useState('How is our relationship doing?');
  const [debugResponse, setDebugResponse] = useState<any>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const runDebugTest = async () => {
    setIsDebugging(true);
    setDebugError(null);
    setDebugResponse(null);

    try {
      console.log('🔍 DEBUG: Sending message:', debugMessage);
      
      const response = await onDebugMessage(debugMessage);
      
      console.log('🔍 DEBUG: Received response:', response);
      setDebugResponse(response);
      
    } catch (error) {
      console.error('🔍 DEBUG: Error occurred:', error);
      setDebugError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsDebugging(false);
    }
  };

  const testDirectAPI = async () => {
    setIsDebugging(true);
    setDebugError(null);
    
    try {
      console.log('🔍 DIRECT API TEST: Testing /api/chat endpoint');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: debugMessage,
          conversationHistory: []
        })
      });

      console.log('🔍 DIRECT API: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🔍 DIRECT API: Response data:', data);
      setDebugResponse(data);
      
    } catch (error) {
      console.error('🔍 DIRECT API: Error:', error);
      setDebugError(error instanceof Error ? error.message : 'API test failed');
    } finally {
      setIsDebugging(false);
    }
  };

  const testWorkerDirect = async () => {
    setIsDebugging(true);
    setDebugError(null);
    
    try {
      console.log('🔍 WORKER TEST: Testing orchestrator worker directly');
      
      // Replace with your actual worker URL
      const workerUrl = 'https://unmask-orchestrator.your-subdomain.workers.dev';
      
      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-123',
          message: debugMessage,
          conversationHistory: []
        })
      });

      console.log('🔍 WORKER: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Worker failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🔍 WORKER: Response data:', data);
      setDebugResponse(data);
      
    } catch (error) {
      console.error('🔍 WORKER: Error:', error);
      setDebugError(error instanceof Error ? error.message : 'Worker test failed');
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Code className="w-5 h-5 mr-2" />
        Chat Debug Console
      </h3>

      {/* Test Message Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Message
        </label>
        <input
          type="text"
          value={debugMessage}
          onChange={(e) => setDebugMessage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter test message..."
        />
      </div>

      {/* Test Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={runDebugTest}
          disabled={isDebugging}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isDebugging ? 'Testing...' : 'Test Chat Flow'}
        </button>
        
        <button
          onClick={testDirectAPI}
          disabled={isDebugging}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Test API Direct
        </button>
        
        <button
          onClick={testWorkerDirect}
          disabled={isDebugging}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          Test Worker Direct
        </button>
      </div>

      {/* Results Display */}
      {debugError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-800 mb-2">
            <AlertCircle className="w-5 h-5 mr-2" />
            Error Detected
          </div>
          <pre className="text-sm text-red-700 whitespace-pre-wrap">{debugError}</pre>
        </div>
      )}

      {debugResponse && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-800 mb-2">
            <CheckCircle className="w-5 h-5 mr-2" />
            Response Received
          </div>
          <pre className="text-sm text-green-700 whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(debugResponse, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Debug Steps:</h4>
        <ol className="list-decimal list-inside space-y-1 text-blue-800">
          <li><strong>Test Chat Flow:</strong> Tests your normal chat component</li>
          <li><strong>Test API Direct:</strong> Tests your Next.js API route</li>
          <li><strong>Test Worker Direct:</strong> Tests your Cloudflare Worker directly</li>
          <li><strong>Check Console:</strong> Open browser dev tools to see detailed logs</li>
        </ol>
      </div>
    </div>
  );
}

// Add this to your chat page temporarily to debug
// app/dashboard/chat/page.tsx - Modified for debugging
'use client';

import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatDebugger } from '@/components/debug/ChatDebugger';

export default function ChatPage() {
  const handleDebugMessage = async (message: string) => {
    // This mimics your chat flow
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversationHistory: []
      })
    });

    if (!response.ok) {
      throw new Error(`Chat failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Add debugger at the top temporarily */}
      <ChatDebugger onDebugMessage={handleDebugMessage} />
      
      {/* Your normal chat interface */}
      <div className="flex-1">
        <ChatInterface />
      </div>
    </div>
  );
}

// Enhanced logging for your API route
// app/api/chat/route.ts - Add detailed logging
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/route';

export async function POST(req: NextRequest) {
  console.log('🔍 API ROUTE: Chat request received');
  
  try {
    const session = await getServerSession(authOptions);
    console.log('🔍 API ROUTE: Session check:', session ? 'Authenticated' : 'No session');
    
    // For debugging, allow requests without auth temporarily
    const userId = session?.user?.id || 'debug-user-123';
    console.log('🔍 API ROUTE: Using userId:', userId);

    const { message, conversationHistory = [] } = await req.json();
    console.log('🔍 API ROUTE: Request body:', { message, historyLength: conversationHistory.length });

    if (!message || message.trim().length === 0) {
      console.log('🔍 API ROUTE: Invalid message');
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check if worker URL is configured
    const workerUrl = process.env.ORCHESTRATOR_WORKER_URL || 'https://unmask-orchestrator.your-subdomain.workers.dev';
    console.log('🔍 API ROUTE: Worker URL:', workerUrl);

    // Call the orchestrator worker
    console.log('🔍 API ROUTE: Calling orchestrator...');
    const orchestratorResponse = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        message,
        conversationHistory,
      }),
    });

    console.log('🔍 API ROUTE: Orchestrator response status:', orchestratorResponse.status);

    if (!orchestratorResponse.ok) {
      const errorText = await orchestratorResponse.text();
      console.log('🔍 API ROUTE: Orchestrator error:', errorText);
      throw new Error(`Orchestrator failed: ${orchestratorResponse.statusText}`);
    }

    const result = await orchestratorResponse.json();
    console.log('🔍 API ROUTE: Orchestrator result:', result);

    // Log the interaction for analytics
    await logChatInteraction(userId, message, result);

    console.log('🔍 API ROUTE: Sending response');
    return NextResponse.json({
      response: result.response,
      agentType: result.agentType,
      confidence: result.confidence,
      nextSteps: result.nextSteps || [],
      relatedInsights: result.relatedInsights || [],
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('🔍 API ROUTE: Error occurred:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        response: "I'm having trouble processing your request right now. Could you try rephrasing your question?",
        agentType: 'error-fallback',
        confidence: 0.1,
        debug: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

async function logChatInteraction(
  userId: string, 
  userMessage: string, 
  agentResponse: any
) {
  try {
    console.log('🔍 LOGGING: Chat interaction:', {
      userId,
      userMessage: userMessage.substring(0, 100) + '...',
      agentType: agentResponse.agentType,
      confidence: agentResponse.confidence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🔍 LOGGING: Failed to log interaction:', error);
  }
}

// Worker debugging template
// workers/agents/orchestrator/index.ts - Add debugging
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    console.log('🔍 WORKER: Request received');
    
    if (request.method !== 'POST') {
      console.log('🔍 WORKER: Invalid method:', request.method);
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const requestBody = await request.json();
      console.log('🔍 WORKER: Request body:', requestBody);

      const { userId, message, conversationHistory } = requestBody;
      
      if (!userId || !message) {
        console.log('🔍 WORKER: Missing required fields');
        return new Response('Missing required fields', { status: 400 });
      }

      console.log('🔍 WORKER: Creating orchestrator...');
      const orchestrator = new MasterOrchestrator(env);
      
      console.log('🔍 WORKER: Processing query...');
      const response = await orchestrator.processUserQuery(userId, message, conversationHistory);
      
      console.log('🔍 WORKER: Response generated:', response);
      
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('🔍 WORKER: Error occurred:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        debug: error instanceof Error ? error.message : 'Unknown error',
        agentType: 'error',
        response: 'Sorry, I encountered an error processing your request.',
        confidence: 0.1
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};