import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

const MEMORY_SEARCH_PROMPT = `
You are a precise memory search assistant. Your job is to find specific conversations and recall exact details.

SEARCH QUERY: {query}

CONVERSATION MATCHES:
{context}

YOUR TASK:
1. Identify the most relevant conversations that match the search
2. Quote exact messages with precise dates and times
3. Provide context around the specific messages
4. Create a chronological timeline if multiple related conversations exist
5. Highlight key information that directly answers the query

RESPONSE FORMAT:
- Start with a direct answer to the query
- List specific conversations with dates and quotes
- Group related conversations together
- Use clear headers and bullet points
- Include exact quotes in quotation marks
- End with a summary of what was found

BE PRECISE: Include exact dates, times, and direct quotes. Don't paraphrase unless necessary for clarity.`

export async function POST(request: NextRequest) {
  try {
    const context = await getCloudflareContext()
    const { env } = context as any

    const { query, searchMode = 'semantic' } = await request.json()

    // For memory search, we want to emphasize specific keywords
    const enhancedQuery = `specific exact "${query}" remember find when what`

    // Generate embedding
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: searchMode === 'keyword' ? query : enhancedQuery
      })
    })

    const embeddingData = await embeddingResponse.json() as any
    const queryVector = embeddingData.data[0].embedding

    // Search with high precision
    const vectorIndex = env.VECTORIZE_INDEX as any
    const matches = await vectorIndex.query(queryVector, {
      topK: 20, // More results for memory search
      returnMetadata: true,
      returnValues: false
    })

    // Filter for high relevance
    const relevantMatches = matches.matches.filter((m: any) => m.score > 0.75)

    if (relevantMatches.length === 0) {
      // Try a broader search
      const broaderMatches = matches.matches.slice(0, 10)
      
      if (broaderMatches.length === 0) {
        return NextResponse.json({
          success: true,
          response: "I couldn't find any conversations matching your search. Try different keywords or a broader search term.",
          sources: []
        })
      }

      // Use broader matches
      relevantMatches.push(...broaderMatches)
    }

    // Format context for memory search
    const formattedContext = relevantMatches.map((match: any, idx: number) => {
      const date = new Date(match.metadata.date)
      return `
[MATCH ${idx + 1}] Relevance: ${(match.score * 100).toFixed(0)}%
Date: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}
Participants: ${match.metadata.sender}
${match.metadata.messageCount} messages in this conversation

CONVERSATION:
${match.metadata.text}
========================`
    }).join('\n\n')

    // Generate memory search response
    const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: MEMORY_SEARCH_PROMPT
              .replace('{query}', query)
              .replace('{context}', formattedContext)
          },
          {
            role: 'user',
            content: `Find: ${query}`
          }
        ],
        temperature: 0.3, // Lower temperature for precise recall
        max_tokens: 1500
      })
    })

    const completionData = await completionResponse.json() as any
    const response = completionData.choices[0].message.content

    return NextResponse.json({
      success: true,
      response,
      stats: {
        totalMatches: relevantMatches.length,
        searchMode,
        averageRelevance: (relevantMatches.reduce((sum: number, m: any) => sum + m.score, 0) / relevantMatches.length * 100).toFixed(1)
      },
      sources: relevantMatches.slice(0, 5).map((match: any) => ({
        date: match.metadata.date,
        participants: match.metadata.sender,
        preview: match.metadata.text.substring(0, 200) + '...',
        relevance: (match.score * 100).toFixed(0) + '%'
      }))
    })

  } catch (error) {
    console.error('Memory search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to search memories'
    }, { status: 500 })
  }
}