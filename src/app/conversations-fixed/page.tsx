// Fixed conversations page with server-side data fetching
import { getCloudflareContext } from '@opennextjs/cloudflare';
import ConversationsClient from './conversations-client';

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

export default async function ConversationsPage() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.DB;

    const result = await db.prepare(`
      SELECT * FROM conversation_chunks
      ORDER BY start_time DESC
      LIMIT 20
    `).all() as { results: ConversationChunk[] };

    const conversations = result.results || [];

    return <ConversationsClient initialConversations={conversations} />;
  } catch (error) {
    console.error('Server error:', error);
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p className="text-red-600">
          Failed to load conversations: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
}