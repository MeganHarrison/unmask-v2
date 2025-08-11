import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: NextRequest) {
  try {
    const context = await getCloudflareContext();
    const db = context?.env?.DB;

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available',
        hasContext: !!context,
        hasEnv: !!context?.env
      }, { status: 500 });
    }

    // Check if the table exists
    const tableCheck = await db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='relationship_events'
    `).first();

    if (!tableCheck) {
      // Try to create the table
      try {
        await db.prepare(`
          CREATE TABLE IF NOT EXISTS relationship_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_date DATE NOT NULL,
            event_time TIME,
            event_type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            notes TEXT,
            category TEXT DEFAULT 'general',
            sentiment TEXT DEFAULT 'neutral',
            significance INTEGER DEFAULT 3 CHECK(significance >= 1 AND significance <= 5),
            initiated_by TEXT,
            location TEXT,
            mood_before TEXT,
            mood_after TEXT,
            relationship_id INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `).run();

        return NextResponse.json({
          success: true,
          message: 'Table created successfully',
          tableExists: true
        });
      } catch (createError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to create table',
          details: createError instanceof Error ? createError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Get table info
    const tableInfo = await db.prepare(`
      PRAGMA table_info(relationship_events)
    `).all();

    // Get row count
    const countResult = await db.prepare(`
      SELECT COUNT(*) as count FROM relationship_events
    `).first();

    return NextResponse.json({
      success: true,
      tableExists: true,
      columns: tableInfo.results,
      rowCount: (countResult as any)?.count || 0
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}