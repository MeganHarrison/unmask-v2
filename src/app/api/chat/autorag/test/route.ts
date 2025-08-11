import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { AUTORAG_CONFIG } from '@/lib/autorag-config'

// Test endpoint to verify AutoRAG is working
export async function GET() {
  try {
    const context = await getCloudflareContext()
    const { env } = context as any

    if (!env?.AI) {
      return NextResponse.json({
        success: false,
        error: 'AI binding not configured'
      }, { status: 500 })
    }

    // Try a simple search query
    const testQuery = "What are some communication patterns in relationships?"
    
    try {
      const searchResponse = await env.AI.autorag(AUTORAG_CONFIG.name).search({
        query: testQuery,
        max_num_results: 3,
        ranking_options: {
          score_threshold: 0.1,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'AutoRAG is configured correctly',
        autoragName: AUTORAG_CONFIG.name,
        testQuery,
        searchResults: searchResponse.data?.length || 0,
        topResult: searchResponse.data?.[0] || null
      })
    } catch (searchError) {
      return NextResponse.json({
        success: false,
        error: 'AutoRAG search failed',
        details: searchError instanceof Error ? searchError.message : 'Unknown error',
        autoragName: AUTORAG_CONFIG.name
      }, { status: 500 })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize context',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}