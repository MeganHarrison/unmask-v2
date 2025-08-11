import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

interface VectorizeMatch {
  id: string
  score: number
  values: number[]
  metadata?: {
    text: string
    date?: string
    sender?: string
    sentiment?: string
    category?: string
    [key: string]: any
  }
}

interface ChatRequest {
  message: string
  conversationHistory?: Array<{
    role: string
    content: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const context = await getCloudflareContext()
    const { env } = context as any

    if (!env?.VECTORIZE_INDEX) {
      console.error('VECTORIZE_INDEX not configured')
      return NextResponse.json({
        response: "I'm having trouble connecting to the knowledge base. Please try again later.",
        timestamp: new Date().toISOString(),
        agentType: 'error',
        confidence: 0.1
      })
    }

    const body: ChatRequest = await request.json()
    const { message, conversationHistory = [] } = body
    const query = message // Map message to query for compatibility

    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        response: "I didn't receive your message. Could you please try again?",
        timestamp: new Date().toISOString(),
        agentType: 'error',
        confidence: 0.1
      })
    }

    // Generate embedding for the query
    // In a real implementation, you would use the same embedding model used to create the vectors
    // For now, we'll use OpenAI's embedding API if available, or a mock embedding
    let queryVector: number[]

    if (env.OPENAI_API_KEY) {
      // Use OpenAI to generate embeddings
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: query
        })
      })

      if (!embeddingResponse.ok) {
        throw new Error('Failed to generate embedding')
      }

      const embeddingData = await embeddingResponse.json() as any
      queryVector = embeddingData.data[0].embedding
    } else {
      // Mock embedding for testing - in production, always use real embeddings
      queryVector = Array(1536).fill(0).map(() => Math.random() - 0.5)
    }

    // Query Vectorize index
    const vectorIndex = env.VECTORIZE_INDEX as any // Cloudflare Vectorize binding
    const matches = await vectorIndex.query(queryVector, { 
      topK: 5, // Return top 5 most relevant matches
      returnMetadata: true,
      returnValues: false
    })

    // Process matches and extract relevant context
    const sources = matches.matches.map((match: VectorizeMatch) => ({
      text: match.metadata?.text || 'No text available',
      score: match.score,
      metadata: match.metadata
    }))

    // Generate response using the context
    let response: string

    if (env.OPENAI_API_KEY && sources.length > 0) {
      // Build context from matches
      const context = sources
        .map((source: any, idx: number) => `[${idx + 1}] ${source.text}`)
        .join('\n\n')

      // Use OpenAI to generate a response
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
              content: `You are an expert relationship analyst with deep understanding of communication patterns, emotional dynamics, and interpersonal relationships. You have access to the user's actual text message conversations with their partner.

CONVERSATION DATA:
${context}

YOUR TASK:
Analyze the provided conversation data to give specific, actionable insights. Focus on:

1. COMMUNICATION PATTERNS:
   - Frequency and timing of messages
   - Who initiates conversations more often
   - Response times and engagement levels
   - Topics that generate the most discussion

2. EMOTIONAL DYNAMICS:
   - Sentiment patterns (positive, neutral, negative)
   - Emotional support exchanges
   - Conflict patterns and resolution styles
   - Expressions of affection or appreciation

3. RELATIONSHIP INDICATORS:
   - Shared interests and activities mentioned
   - Future planning discussions
   - Support during challenges
   - Balance of conversation topics (practical vs emotional)

4. SPECIFIC OBSERVATIONS:
   - Quote actual messages when relevant
   - Point out specific examples from the data
   - Identify recurring themes or issues
   - Note changes over time if apparent

RESPONSE GUIDELINES:
- Be specific and reference the actual conversations
- Provide concrete examples from the messages
- Offer balanced perspectives (both strengths and areas for growth)
- Suggest actionable improvements based on observed patterns
- Avoid generic advice - tailor everything to THEIR specific conversations
- If asked about patterns, provide specific dates, frequencies, or examples

Remember: You're analyzing REAL conversations between the user and their partner. Make your insights personal, specific, and directly relevant to what you see in their actual messages.`
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!completionResponse.ok) {
        throw new Error('Failed to generate response')
      }

      const completionData = await completionResponse.json() as any
      response = completionData.choices[0].message.content
    } else if (sources.length > 0) {
      // Fallback response without OpenAI
      response = `Based on your relationship data, here are some relevant insights:\n\n${
        sources.map((source: any, idx: number) => `${idx + 1}. ${source.text}`).join('\n\n')
      }\n\nThese patterns suggest areas you might want to explore further in your relationship.`
    } else {
      response = "I couldn't find specific information related to your query in the relationship data. Could you try rephrasing your question or asking about something else?"
    }

    // Determine agent type based on query content
    let agentType = 'memory';
    let confidence = 0.85;
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('advice') || lowerQuery.includes('should') || lowerQuery.includes('help')) {
      agentType = 'coaching';
    } else if (lowerQuery.includes('pattern') || lowerQuery.includes('analyze') || lowerQuery.includes('trend')) {
      agentType = 'insights';
    }

    // Generate next steps based on response
    const nextSteps = [
      "Ask me to analyze specific time periods",
      "Request insights about communication patterns",
      "Get personalized relationship advice"
    ];

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      agentType,
      confidence,
      nextSteps,
      relatedInsights: sources.slice(0, 3).map((s: any) => s.text.substring(0, 100) + '...'),
      coachingStyle: 'supportive',
      interventionType: 'exploratory'
    })

  } catch (error) {
    console.error('RAG error:', error)
    return NextResponse.json({
      response: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
      timestamp: new Date().toISOString(),
      agentType: 'error',
      confidence: 0.1,
      nextSteps: ["Try rephrasing your question", "Ask a more specific question", "Check back in a few minutes"]
    })
  }
}

// Helper endpoint to check if RAG is properly configured
export async function GET() {
  try {
    const context = await getCloudflareContext()
    const { env } = context as any

    return NextResponse.json({
      success: true,
      configured: {
        vectorize: !!env?.VECTORIZE_INDEX,
        openai: !!env?.OPENAI_API_KEY
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check configuration'
    }, { status: 500 })
  }
}