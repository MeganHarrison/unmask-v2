import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import OpenAI from 'openai';


// POST endpoint to analyze messages
export async function POST(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB;
    
    if (!env.OPENAI_API_KEY) {
      return NextResponse.json({
        message: 'OpenAI API key not configured',
        analyzed: 0,
        total: 0
      });
    }
    
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY as string,
    });
    
    // Get unanalyzed messages (limit to 50 per batch)
    const unanalyzedResult = await db.prepare(`
      SELECT id, message, sender, date_time 
      FROM "texts-bc" 
      WHERE sentiment_score IS NULL 
      LIMIT 50
    `).all();
    
    const messages = unanalyzedResult.results || [];
    let analyzed = 0;
    
    // Analyze each message
    for (const msg of messages as any[]) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Analyze the sentiment of this message. Return a JSON object with sentiment_score (-1 to 1) and conflict_detected (boolean).'
            },
            {
              role: 'user',
              content: String(msg.message)
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 100
        });
        
        const analysis = JSON.parse(response.choices[0].message.content || '{}');
        
        // Update the message with analysis
        await db.prepare(`
          UPDATE "texts-bc" 
          SET sentiment_score = ?, conflict_detected = ?
          WHERE id = ?
        `).bind(
          analysis.sentiment_score || 0,
          analysis.conflict_detected ? 1 : 0,
          msg.id
        ).run();
        
        analyzed++;
      } catch (error) {
        console.error(`Error analyzing message ${msg.id}:`, error);
      }
    }
    
    // Get total count
    const totalResult = await db.prepare('SELECT COUNT(*) as count FROM "texts-bc"').first();
    const total = Number(totalResult?.count || 0);
    
    return NextResponse.json({
      message: `Analyzed ${analyzed} messages`,
      analyzed,
      total: messages.length
    });
    
  } catch (error) {
    console.error('Error in message analysis:', error);
    
    if (error instanceof Error && error.message.includes('getCloudflareContext')) {
      return NextResponse.json({
        message: 'Database not available in local development',
        analyzed: 0,
        total: 0
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze messages' },
      { status: 500 }
    );
  }
}

// GET endpoint to check analysis progress
export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB;
    
    // Get counts
    const totalResult = await db.prepare('SELECT COUNT(*) as count FROM "texts-bc"').first();
    const analyzedResult = await db.prepare('SELECT COUNT(*) as count FROM "texts-bc" WHERE sentiment_score IS NOT NULL').first();
    
    const total = Number(totalResult?.count || 0);
    const analyzed = Number(analyzedResult?.count || 0);
    const unanalyzed = total - analyzed;
    const percentage = total > 0 ? Math.round((analyzed / total) * 100) : 0;
    
    return NextResponse.json({
      total,
      analyzed,
      unanalyzed,
      percentage
    });
    
  } catch (error) {
    console.error('Error checking analysis progress:', error);
    
    if (error instanceof Error && error.message.includes('getCloudflareContext')) {
      return NextResponse.json({
        total: 0,
        analyzed: 0,
        unanalyzed: 0,
        percentage: 0,
        error: 'Database not available in local development'
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to check progress' },
      { status: 500 }
    );
  }
}