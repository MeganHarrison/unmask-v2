import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function GET(request: NextRequest) {
  try {
    const context = await getCloudflareContext()
    const { env } = context as any

    if (!env?.VECTORIZE_INDEX) {
      return NextResponse.json({
        success: false,
        error: 'Vectorize index not configured'
      }, { status: 500 })
    }

    const vectorIndex = env.VECTORIZE_INDEX as any

    // Try to get index info
    let indexInfo = null
    try {
      // Vectorize doesn't have a direct "info" method, but we can try a query
      // to see if the index is working
      const testQuery = await vectorIndex.query(
        Array(1536).fill(0).map(() => Math.random() - 0.5), 
        { topK: 1 }
      )
      
      indexInfo = {
        working: true,
        sampleMatch: testQuery.matches && testQuery.matches.length > 0 ? testQuery.matches[0] : null,
        matchCount: testQuery.matches ? testQuery.matches.length : 0
      }
    } catch (error) {
      indexInfo = {
        working: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Get some statistics from D1 about what could be vectorized
    if (env?.DB) {
      const stats = await env.DB.prepare(`
        SELECT 
          COUNT(*) as total_messages,
          COUNT(DISTINCT sender) as unique_senders,
          MIN(date_time) as earliest_message,
          MAX(date_time) as latest_message,
          COUNT(CASE WHEN sentiment IS NOT NULL AND sentiment != '' THEN 1 END) as messages_with_sentiment
        FROM "texts-bc"
      `).first()

      // Check if we have any vectorized messages by checking for specific IDs
      const sampleIds = ['msg_1', 'msg_2', 'msg_3', 'msg_4', 'msg_5']
      let vectorizedSamples = []
      
      for (const id of sampleIds) {
        try {
          const result = await vectorIndex.getByIds([id])
          if (result && result.length > 0) {
            vectorizedSamples.push(result[0])
          }
        } catch (e) {
          // ID doesn't exist, continue
        }
      }

      return NextResponse.json({
        success: true,
        vectorizeIndex: {
          name: 'relationship-insights',
          status: indexInfo,
          vectorizedSamples: vectorizedSamples.length,
          sampleVectors: vectorizedSamples.slice(0, 2) // Show first 2 samples
        },
        database: {
          totalMessages: stats?.total_messages || 0,
          uniqueSenders: stats?.unique_senders || 0,
          dateRange: {
            earliest: stats?.earliest_message,
            latest: stats?.latest_message
          },
          messagesWithSentiment: stats?.messages_with_sentiment || 0
        },
        recommendations: {
          shouldPopulate: vectorizedSamples.length === 0,
          message: vectorizedSamples.length === 0 
            ? 'No vectors found. Run /api/vectorize/populate to create vectors from your messages.'
            : `Found ${vectorizedSamples.length} sample vectors. Index appears to be populated.`
        }
      })
    }

    return NextResponse.json({
      success: true,
      vectorizeIndex: {
        name: 'relationship-insights',
        status: indexInfo
      },
      database: 'No database connection to check messages'
    })

  } catch (error) {
    console.error('Vectorize check error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check vectorize index'
    }, { status: 500 })
  }
}