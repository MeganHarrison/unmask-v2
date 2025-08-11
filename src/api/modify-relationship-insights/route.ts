import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // This assumes you have D1 binding configured in your Next.js app
    // via the Cloudflare adapter
    const env = process.env as any;
    
    if (!env.DB) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const results: {
      alterTable: any;
      createIndex: any;
      tableInfo: any;
    } = {
      alterTable: null,
      createIndex: null,
      tableInfo: null
    };

    // 1. Add the relationship_id column
    try {
      await env.DB.exec(`ALTER TABLE relationship_insights ADD COLUMN relationship_id INTEGER;`);
      results.alterTable = { success: true, message: "Column added successfully" };
    } catch (error: any) {
      // Column might already exist
      if (error.message.includes('duplicate column name')) {
        results.alterTable = { success: true, message: "Column already exists" };
      } else {
        results.alterTable = { success: false, error: error.message };
      }
    }

    // 2. Create the index
    try {
      await env.DB.exec(`CREATE INDEX idx_relationship_insights_relationship_id ON relationship_insights(relationship_id);`);
      results.createIndex = { success: true, message: "Index created successfully" };
    } catch (error: any) {
      // Index might already exist
      if (error.message.includes('already exists')) {
        results.createIndex = { success: true, message: "Index already exists" };
      } else {
        results.createIndex = { success: false, error: error.message };
      }
    }

    // 3. Verify the modification
    try {
      const tableInfo = await env.DB.prepare(`PRAGMA table_info(relationship_insights);`).all();
      results.tableInfo = { 
        success: true, 
        columns: tableInfo.results,
        hasRelationshipId: tableInfo.results.some((col: any) => col.name === 'relationship_id')
      };
    } catch (error: any) {
      results.tableInfo = { success: false, error: error.message };
    }

    return NextResponse.json({
      status: 'completed',
      database: 'megan-personal',
      table: 'relationship_insights',
      results: results
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return NextResponse.json({
    message: 'Use POST method to modify the relationship_insights table',
    operations: [
      'ALTER TABLE relationship_insights ADD COLUMN relationship_id INTEGER',
      'CREATE INDEX idx_relationship_insights_relationship_id ON relationship_insights(relationship_id)',
      'PRAGMA table_info(relationship_insights)'
    ]
  });
}