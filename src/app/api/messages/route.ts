// app/api/messages/route.ts
// Connect to your D1 database with vectorization support

export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface Message {
  id: number;
  date_time: string;
  date: string;
  time: string;
  type: 'Incoming' | 'Outgoing';
  sender: string;
  message: string;
  attachment: string;
  tag: string;
  sentiment: string;
  category: string;
  vector_embedding?: string; // For vectorized search
}

export async function GET(request: NextRequest) {
  try {
    // Get the Cloudflare context to access bindings
    const { env } = getCloudflareContext();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const semanticSearch = searchParams.get('semantic') || '';
    const offset = (page - 1) * limit;

    // Connect to your D1 database
    const db = env.DB; // This should be bound to your D1 database
    
    if (!db) {
      throw new Error('Database connection not available. Check D1 bindings in wrangler.toml');
    }

    let messages: Message[] = [];
    let totalCount = 0;

    if (semanticSearch) {
      // Vector-based semantic search using your strategy
      // This would integrate with Cloudflare Vectorize
      messages = await performVectorSearch(db, env, semanticSearch, limit, offset);
      
      // Get count for semantic search (approximate)
      totalCount = await getSemanticSearchCount(db, env, semanticSearch);
    } else if (search) {
      // Traditional text search
      const query = `
        SELECT * FROM "texts-bc" 
        WHERE (message LIKE ? OR sender LIKE ?) 
        ORDER BY date_time DESC 
        LIMIT ? OFFSET ?
      `;
      const params = [`%${search}%`, `%${search}%`, limit, offset];
      
      const result = await db.prepare(query).bind(...params).all();
      messages = result.results as Message[];
      
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as count FROM "texts-bc" 
        WHERE (message LIKE ? OR sender LIKE ?)
      `;
      const countResult = await db.prepare(countQuery).bind(`%${search}%`, `%${search}%`).first();
      totalCount = countResult?.count || 0;
    } else {
      // Get all messages with pagination
      const query = `
        SELECT * FROM "texts-bc" 
        ORDER BY date_time DESC 
        LIMIT ? OFFSET ?
      `;
      
      const result = await db.prepare(query).bind(limit, offset).all();
      messages = result.results as Message[];
      
      // Get total count
      const countResult = await db.prepare('SELECT COUNT(*) as count FROM "texts-bc"').first();
      totalCount = countResult?.count || 0;
    }

    return new Response(
      JSON.stringify({
        messages,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: offset + limit < totalCount,
          hasPrev: page > 1
        },
        filters: {
          search,
          semanticSearch
        },
        metadata: {
          databaseId: 'f450193b-9536-4ada-8271-2a8cd917069e',
          searchType: semanticSearch ? 'vector' : search ? 'text' : 'all',
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );

  } catch (error) {
    console.error('Messages API Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch messages',
        message: error instanceof Error ? error.message : 'Unknown error',
        databaseId: 'f450193b-9536-4ada-8271-2a8cd917069e',
        messages: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// Vector search implementation based on your strategy document
async function performVectorSearch(
  db: any, 
  env: any, 
  query: string, 
  limit: number, 
  offset: number
): Promise<Message[]> {
  try {
    // This implements your "Emotional Fingerprints" concept
    // 1. Convert query to vector embedding
    // 2. Search Cloudflare Vectorize for similar emotional patterns
    // 3. Return contextual conversation chunks
    
    const vectorIndex = env.VECTORIZE_INDEX; // Your Vectorize binding
    
    if (!vectorIndex) {
      console.warn('Vectorize not available, falling back to text search');
      const fallbackQuery = `
        SELECT * FROM "texts-bc" 
        WHERE message LIKE ? 
        ORDER BY date_time DESC 
        LIMIT ? OFFSET ?
      `;
      const result = await db.prepare(fallbackQuery).bind(`%${query}%`, limit, offset).all();
      return result.results as Message[];
    }

    // Generate embedding for search query
    // This would typically use your AI service to create the vector
    const queryVector = await generateEmbedding(query, env);
    
    // Search vector database for similar emotional patterns
    const vectorResults = await vectorIndex.query(queryVector, {
      topK: limit,
      returnMetadata: true,
      filter: {} // Add temporal filters, emotional intensity filters, etc.
    });

    // Convert vector results back to message objects
    const messageIds = vectorResults.matches.map((match: any) => match.metadata.messageId);
    
    if (messageIds.length === 0) {
      return [];
    }

    // Fetch full message details from D1
    const placeholders = messageIds.map(() => '?').join(',');
    const messagesQuery = `
      SELECT * FROM "texts-bc" 
      WHERE id IN (${placeholders}) 
      ORDER BY date_time DESC
    `;
    
    const result = await db.prepare(messagesQuery).bind(...messageIds).all();
    return result.results as Message[];
    
  } catch (error) {
    console.error('Vector search failed:', error);
    // Fallback to regular search
    const fallbackQuery = `
      SELECT * FROM "texts-bc" 
      WHERE message LIKE ? 
      ORDER BY date_time DESC 
      LIMIT ? OFFSET ?
    `;
    const result = await db.prepare(fallbackQuery).bind(`%${query}%`, limit, offset).all();
    return result.results as Message[];
  }
}

async function getSemanticSearchCount(db: any, env: any, query: string): Promise<number> {
  // For vector search, return approximate count
  // In production, you might cache this or use a different strategy
  return 100; // Placeholder - implement based on your vector search results
}

async function generateEmbedding(text: string, env: any): Promise<number[]> {
  try {
    // This would integrate with your AI service (Claude, OpenAI, etc.)
    // to generate vector embeddings for the emotional fingerprinting
    
    // For now, return a mock embedding
    // In production, this would call your AI service
    const mockEmbedding = new Array(1024).fill(0).map(() => Math.random());
    return mockEmbedding;
    
  } catch (error) {
    console.error('Embedding generation failed:', error);
    // Return zero vector as fallback
    return new Array(1024).fill(0);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}