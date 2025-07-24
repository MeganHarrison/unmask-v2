import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function PATCH(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const { messageId, updates } = await request.json() as { messageId: number; updates: any };
    
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    const db = env.DB;
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Simple update for conflict_detected
    if ('conflict_detected' in updates) {
      await db.prepare(
        'UPDATE "texts-bc" SET conflict_detected = ? WHERE id = ?'
      ).bind(updates.conflict_detected ? 1 : 0, messageId).run();
    }

    // Update sentiment score
    if ('sentiment_score' in updates) {
      await db.prepare(
        'UPDATE "texts-bc" SET sentiment_score = ? WHERE id = ?'
      ).bind(updates.sentiment_score, messageId).run();
    }

    // Get updated message
    const updated = await db.prepare(
      'SELECT * FROM "texts-bc" WHERE id = ?'
    ).bind(messageId).first();

    return NextResponse.json({ 
      success: true, 
      message: updated 
    });

  } catch (error) {
    console.error('Update message error:', error);
    return NextResponse.json({
      error: 'Failed to update message',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}