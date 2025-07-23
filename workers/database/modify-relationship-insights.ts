import { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // Execute the SQL commands in sequence
      const results = {
        alterTable: null,
        createIndex: null,
        tableInfo: null
      };

      // 1. Add the relationship_id column
      try {
        await env.DB.exec(`ALTER TABLE relationship_insights ADD COLUMN relationship_id INTEGER;`);
        results.alterTable = { success: true, message: "Column added successfully" };
      } catch (error) {
        results.alterTable = { success: false, error: error.message };
      }

      // 2. Create the index
      try {
        await env.DB.exec(`CREATE INDEX idx_relationship_insights_relationship_id ON relationship_insights(relationship_id);`);
        results.createIndex = { success: true, message: "Index created successfully" };
      } catch (error) {
        results.createIndex = { success: false, error: error.message };
      }

      // 3. Verify the modification
      try {
        const tableInfo = await env.DB.prepare(`PRAGMA table_info(relationship_insights);`).all();
        results.tableInfo = { success: true, data: tableInfo.results };
      } catch (error) {
        results.tableInfo = { success: false, error: error.message };
      }

      return Response.json({
        status: 'completed',
        results: results
      });

    } catch (error) {
      return Response.json({
        status: 'error',
        error: error.message
      }, { status: 500 });
    }
  },
};