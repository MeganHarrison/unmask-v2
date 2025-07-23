import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export async function GET(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db = env.DB;
    
    // Test 1: List all tables
    const tables = await db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `).all();
    
    // Test 2: Get table info for texts-bc
    const tableInfo = await db.prepare(`
      PRAGMA table_info("texts-bc")
    `).all();
    
    // Test 3: Get a sample message
    const sampleMessage = await db.prepare(`
      SELECT * FROM "texts-bc" 
      LIMIT 1
    `).first();
    
    // Test 4: Count messages
    const messageCount = await db.prepare(`
      SELECT COUNT(*) as count FROM "texts-bc"
    `).first();
    
    return NextResponse.json({
      tables: tables.results,
      tableInfo: tableInfo.results,
      sampleMessage,
      messageCount,
      success: true
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      success: false
    }, { status: 500 });
  }
}