import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';


export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB;
    
    // Get all tables with their SQL definitions
    const tablesResult = await db.prepare(`
      SELECT name, type, tbl_name, rootpage, sql 
      FROM sqlite_master 
      WHERE type = 'table' 
      AND name NOT LIKE 'sqlite_%'
      AND name NOT LIKE '_cf_%'
      ORDER BY name
    `).all();
    
    // Get detailed column info for each table
    const tableDetails = [];
    for (const table of tablesResult.results || []) {
      const columnsResult = await db.prepare(`
        PRAGMA table_info("${table.name}")
      `).all();
      
      // Get row count for each table
      const countResult = await db.prepare(`
        SELECT COUNT(*) as count FROM "${table.name}"
      `).first();
      
      tableDetails.push({
        name: table.name,
        type: table.type,
        sql: table.sql,
        columns: columnsResult.results,
        rowCount: countResult?.count || 0
      });
    }
    
    return NextResponse.json({
      tables: tablesResult.results || [],
      tableDetails,
      totalTables: tablesResult.results?.length || 0,
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