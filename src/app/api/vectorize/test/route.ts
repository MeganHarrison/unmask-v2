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

    // Create a test query vector
    const testVector = Array(1536).fill(0).map(() => Math.random() - 0.5)
    
    // Query for some results
    const results = await vectorIndex.query(testVector, { 
      topK: 5,
      returnMetadata: true,
      returnValues: false
    })

    // Also try to get by a specific ID if we know one
    let specificVector = null
    try {
      const ids = await vectorIndex.getByIds(['conversation_0_1671885450000'])
      if (ids && ids.length > 0) {
        specificVector = ids[0]
      }
    } catch (e) {
      // ID might not exist
    }

    return NextResponse.json({
      success: true,
      queryResults: {
        matches: results.matches,
        count: results.matches ? results.matches.length : 0
      },
      specificVector: specificVector,
      indexInfo: {
        name: 'relationship-insights-1536'
      }
    })

  } catch (error) {
    console.error('Vectorize test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to test vectorize'
    }, { status: 500 })
  }
}