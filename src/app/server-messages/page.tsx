// Server-side messages page to test if it's a client hydration issue
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface Message {
  id: number;
  date: string;
  time: string;
  date_time: string;
  type: string;
  sender: string;
  message: string;
  attachment: string | null;
  sentiment: string | null;
  sentiment_score: number | null;
  conflict_detected: boolean;
  emotional_score: number | null;
  tags_json: string | null;
  relationship_id: number;
}

export default async function ServerMessagesPage() {
  try {
    const { env } = await getCloudflareContext({async: true});
    const db = env.DB;

    // Get messages directly in the page component
    const messagesResult = await db.prepare(`
      SELECT * FROM "texts-bc"
      ORDER BY date_time DESC
      LIMIT 10
    `).all() as { results: Message[] };

    const messages = messagesResult.results || [];

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Server-Side Messages</h1>
        
        {messages.length === 0 ? (
          <p>No messages found</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="p-4 border rounded">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{msg.sender}</span>
                  <span>{msg.date} {msg.time}</span>
                </div>
                <p className="text-gray-800">{msg.message}</p>
                {msg.sentiment_score && (
                  <div className="mt-2 text-sm">
                    Sentiment: {msg.sentiment_score}/10
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Server error:', error);
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p className="text-red-600">
          Failed to load messages: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
}