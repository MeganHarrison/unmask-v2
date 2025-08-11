import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: NextRequest) {
  try {
    const context = await getCloudflareContext();
    const db = context?.env?.DB;

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    // Create the relationship_events table
    const createTableResult = await db.prepare(`
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

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_event_date ON relationship_events(event_date)',
      'CREATE INDEX IF NOT EXISTS idx_event_type ON relationship_events(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_category ON relationship_events(category)',
      'CREATE INDEX IF NOT EXISTS idx_created_at ON relationship_events(created_at)'
    ];

    for (const indexQuery of indexes) {
      try {
        await db.prepare(indexQuery).run();
      } catch (indexError) {
        console.log('Index might already exist:', indexError);
      }
    }

    // Verify the table was created
    const tableCheck = await db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='relationship_events'
    `).first();

    // Get table structure
    const tableInfo = await db.prepare(`
      PRAGMA table_info(relationship_events)
    `).all();

    return NextResponse.json({
      success: true,
      message: 'Table created successfully',
      tableExists: !!tableCheck,
      columns: tableInfo.results,
      createResult: createTableResult
    });

  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create table'
    }, { status: 500 });
  }
}