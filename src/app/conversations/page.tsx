// app/conversations/page.tsx
// Minimal version using only basic HTML

'use client';

import { useState, useEffect } from 'react';

interface ConversationChunk {
  id: number;
  start_time: string;
  end_time: string;
  message_count: number;
  chunk_summary: string;
  emotional_tone: string;
  conflict_detected: boolean;
  sentiment_score: number;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationChunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations?limit=10');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json() as { conversations: ConversationChunk[] };
      setConversations(data.conversations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading conversations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading conversations...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Conversation Threads</h1>
      <p className="text-gray-600 mb-6">Grouped conversations by emotional context and themes</p>

      <div className="space-y-6">
        {conversations.map((conversation) => (
          <div 
            key={conversation.id} 
            className={`p-6 border rounded-lg ${
              conversation.conflict_detected ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold">
                  {conversation.emotional_tone} Conversation
                </h3>
                {conversation.conflict_detected && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                    Conflict
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(conversation.start_time).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span>{conversation.message_count} messages</span>
              <span>Sentiment: {conversation.sentiment_score.toFixed(1)}/10</span>
              <span className={`px-2 py-1 rounded ${
                conversation.emotional_tone === 'positive' ? 'bg-green-100 text-green-800' :
                conversation.emotional_tone === 'negative' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {conversation.emotional_tone}
              </span>
            </div>

            <p className="text-gray-800 leading-relaxed">
              {conversation.chunk_summary || 'No summary available for this conversation.'}
            </p>
          </div>
        ))}
      </div>

      {conversations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <h3 className="text-lg font-medium mb-2">No conversations found</h3>
          <p>Your conversation chunks table might be empty or the API isn&apos;t working.</p>
        </div>
      )}
    </div>
  );
}