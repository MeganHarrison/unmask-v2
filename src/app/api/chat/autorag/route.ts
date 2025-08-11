import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { AUTORAG_CONFIG, buildAutoRAGQuery } from '@/lib/autorag-config'

interface ChatRequest {
  message: string
  conversationHistory?: Array<{
    role: string
    content: string
  }>
}

interface AutoRAGResponse {
  object: string
  search_query: string
  response: string
  data: Array<{
    file_id: string
    filename: string
    score: number
    attributes: {
      modified_date: number
      folder: string
    }
    content: Array<{
      id: string
      type: string
      text: string
    }>
  }>
  has_more: boolean
  next_page: null | string
}

export async function POST(request: NextRequest) {
  try {
    const context = await getCloudflareContext()
    const { env } = context as any

    if (!env?.AI) {
      console.error('AI binding not configured')
      return NextResponse.json({
        response: "I'm having trouble connecting to the AI system. Please try again later.",
        timestamp: new Date().toISOString(),
        agentType: 'error',
        confidence: 0.1
      })
    }

    const body: ChatRequest = await request.json()
    const { message, conversationHistory = [] } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        response: "I didn't receive your message. Could you please try again?",
        timestamp: new Date().toISOString(),
        agentType: 'error',
        confidence: 0.1
      })
    }

    let useAutoRAG = true
    let response: any
    
    try {
      // Build AutoRAG query using our configuration
      const autoragQuery = buildAutoRAGQuery(message)
      
      // Call AutoRAG using the AI binding
      const autoragResponse = await env.AI.autorag(AUTORAG_CONFIG.name).aiSearch(autoragQuery) as AutoRAGResponse
      
      // Determine agent type based on query content
      let agentType = 'memory'
      let confidence = 0.85
      const lowerQuery = message.toLowerCase()
      
      if (lowerQuery.includes('advice') || lowerQuery.includes('should') || lowerQuery.includes('help')) {
        agentType = 'coaching'
      } else if (lowerQuery.includes('pattern') || lowerQuery.includes('analyze') || lowerQuery.includes('trend')) {
        agentType = 'insights'
      } else if (lowerQuery.includes('conflict') || lowerQuery.includes('fight') || lowerQuery.includes('argument')) {
        agentType = 'conflict'
      }

      // Generate next steps based on the response
      const nextSteps = [
        "Ask me to analyze specific time periods",
        "Request insights about communication patterns", 
        "Get personalized relationship advice",
        "Explore conflict resolution strategies"
      ]

      // Extract related insights from the search results
      const relatedInsights = autoragResponse.data
        .slice(0, 3)
        .map(result => result.content[0]?.text.substring(0, 100) + '...')

      response = {
        response: autoragResponse.response,
        timestamp: new Date().toISOString(),
        agentType,
        confidence,
        nextSteps,
        relatedInsights,
        coachingStyle: 'supportive',
        interventionType: 'exploratory',
        searchResults: autoragResponse.data.length,
        model: AUTORAG_CONFIG.model
      }
    } catch (autoragError) {
      console.error('AutoRAG failed, falling back to regular RAG:', autoragError)
      useAutoRAG = false
      
      // Fallback to regular RAG endpoint
      try {
        const baseUrl = request.url.split('/api/chat/autorag')[0]
        const ragResponse = await fetch(`${baseUrl}/api/chat/rag`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            conversationHistory
          })
        })
        
        if (!ragResponse.ok) {
          throw new Error('RAG fallback also failed')
        }
        
        response = await ragResponse.json()
        response.model = 'gpt-4-turbo-preview (fallback)'
        response.autoragFailed = true
      } catch (ragError) {
        console.error('Both AutoRAG and RAG failed:', ragError)
        throw new Error('Unable to process request with either AutoRAG or RAG')
      }
    }
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('AutoRAG error:', error)
    return NextResponse.json({
      response: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
      timestamp: new Date().toISOString(),
      agentType: 'error', 
      confidence: 0.1,
      nextSteps: ["Try rephrasing your question", "Ask a more specific question", "Check back in a few minutes"],
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Helper endpoint to check if AutoRAG is properly configured
export async function GET() {
  try {
    const context = await getCloudflareContext()
    const { env } = context as any

    return NextResponse.json({
      success: true,
      configured: {
        ai: !!env?.AI,
        autoragName: AUTORAG_CONFIG.name,
        model: AUTORAG_CONFIG.model
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check configuration'
    }, { status: 500 })
  }
}