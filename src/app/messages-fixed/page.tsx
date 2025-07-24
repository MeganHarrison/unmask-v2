// Fixed messages page with server-side data fetching
import { getCloudflareContext } from '@opennextjs/cloudflare';
import MessagesClient from './messages-client';

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

interface SearchParams {
  page?: string;
  limit?: string;
  search?: string;
  sender?: string;
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '100');
  
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.DB;

    // Get total count
    const countResult = await db.prepare(`
      SELECT COUNT(*) as total FROM "texts-bc"
    `).first() as { total: number };

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Get messages
    const messagesResult = await db.prepare(`
      SELECT * FROM "texts-bc"
      ORDER BY date_time DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all() as { results: Message[] };

    const messages = messagesResult.results || [];

    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return <MessagesClient initialMessages={messages} initialPagination={pagination} />;
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