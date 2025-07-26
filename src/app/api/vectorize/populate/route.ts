import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

interface TextMessage {
  id: number
  date_time: string
  sender: string
  message: string
  sentiment: string
  category: string
  tag: string
}

interface VectorData {
  id: string
  values: number[]
  metadata: {
    text: string
    date: string
    endDate?: string
    sender: string
    sentiment: string
    category: string
    tag: string
    type: string
    messageCount?: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getCloudflareContext()
    const { env } = context as any

    if (!env?.VECTORIZE_INDEX || !env?.DB) {
      return NextResponse.json({
        success: false,
        error: 'Vectorize or database not configured'
      }, { status: 500 })
    }

    const body = await request.json().catch(() => ({})) as any
    const batchSize = body.batchSize || 1000
    const offset = body.offset || 0

    // Fetch all messages ordered by date and sender to group conversations
    const messagesQuery = `
      SELECT id, date_time, sender, message, sentiment, category, tag
      FROM "texts-bc"
      ORDER BY date_time ASC
      LIMIT ? OFFSET ?
    `

    const result = await env.DB.prepare(messagesQuery).bind(batchSize, offset).all()
    const messages = result.results as TextMessage[]

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No messages found to vectorize',
        hasMore: false
      })
    }

    const vectors: VectorData[] = []
    const conversationChunks: Array<TextMessage[]> = []
    let currentChunk: TextMessage[] = []
    let lastMessageTime: Date | null = null

    // Group messages into conversation chunks (messages within 30 minutes of each other)
    for (const msg of messages) {
      const msgTime = new Date(msg.date_time)
      
      if (lastMessageTime && (msgTime.getTime() - lastMessageTime.getTime()) > 30 * 60 * 1000) {
        // More than 30 minutes gap, start a new conversation chunk
        if (currentChunk.length > 0) {
          conversationChunks.push(currentChunk)
          currentChunk = []
        }
      }
      
      currentChunk.push(msg)
      lastMessageTime = msgTime
    }

    // Don't forget the last chunk
    if (currentChunk.length > 0) {
      conversationChunks.push(currentChunk)
    }

    // Process each conversation chunk
    for (let i = 0; i < conversationChunks.length; i++) {
      const chunk = conversationChunks[i]
      const startTime = new Date(chunk[0].date_time)
      const endTime = new Date(chunk[chunk.length - 1].date_time)
      
      // Create a summary of the conversation
      const participants = [...new Set(chunk.map(m => m.sender))].join(', ')
      const sentiments = chunk.map(m => m.sentiment).filter(s => s)
      const avgSentiment = sentiments.length > 0 ? 
        sentiments.join(', ') : 'neutral'
      
      // Combine messages for context
      const conversationText = chunk.map(msg => 
        `${msg.sender}: ${msg.message}`
      ).join('\n')
      
      const textForEmbedding = `
        Conversation from ${startTime.toLocaleString()} to ${endTime.toLocaleString()}
        Participants: ${participants}
        Message count: ${chunk.length}
        Overall sentiment: ${avgSentiment}
        
        Messages:
        ${conversationText.substring(0, 2000)} ${conversationText.length > 2000 ? '...' : ''}
      `.trim()

      let embedding: number[]

      if (env.OPENAI_API_KEY) {
        // Generate real embedding using OpenAI
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: textForEmbedding
          })
        })

        if (!embeddingResponse.ok) {
          console.error('Failed to generate embedding for conversation chunk', i)
          continue
        }

        const embeddingData = await embeddingResponse.json() as any
        embedding = embeddingData.data[0].embedding
      } else {
        // Mock embedding for testing
        embedding = Array(1536).fill(0).map(() => Math.random() - 0.5)
      }

      vectors.push({
        id: `conversation_${offset + i}_${startTime.getTime()}`,
        values: embedding,
        metadata: {
          text: conversationText.substring(0, 1000),
          date: startTime.toISOString(),
          endDate: endTime.toISOString(),
          sender: participants,
          sentiment: avgSentiment,
          category: chunk[0].category || 'general',
          tag: chunk[0].tag || 'conversation',
          type: 'conversation',
          messageCount: chunk.length
        }
      })
    }

    // Insert vectors into Vectorize index
    if (vectors.length > 0) {
      const vectorIndex = env.VECTORIZE_INDEX as any
      await vectorIndex.insert(vectors)
    }

    // Check if there are more messages to process
    const totalCountResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM "texts-bc"'
    ).first()
    const totalCount = (totalCountResult as any)?.count || 0
    const hasMore = offset + batchSize < totalCount

    return NextResponse.json({
      success: true,
      vectorized: {
        conversations: vectors.length,
        messagesProcessed: messages.length,
        offset: offset,
        batchSize: batchSize,
        hasMore: hasMore,
        totalMessages: totalCount
      }
    })

  } catch (error) {
    console.error('Vectorize population error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to populate vectors'
    }, { status: 500 })
  }
}

// GET endpoint to check index status
export async function GET() {
  try {
    const context = await getCloudflareContext()
    const { env } = context as any

    if (!env?.VECTORIZE_INDEX) {
      return NextResponse.json({
        success: false,
        error: 'Vectorize not configured'
      })
    }

    // Get index info if available
    const vectorIndex = env.VECTORIZE_INDEX as any
    
    return NextResponse.json({
      success: true,
      index: 'relationship-insights-1536',
      status: 'ready'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check index status'
    }, { status: 500 })
  }
}