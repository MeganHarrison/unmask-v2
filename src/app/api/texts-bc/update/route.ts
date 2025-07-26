import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as { id: number; field: string; value: string };
    const { id, field, value } = body;
    
    if (!id || !field || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate field names
    const allowedFields = ['sentiment', 'category', 'tag'];
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: 'Invalid field name' },
        { status: 400 }
      );
    }

    const { env } = await getCloudflareContext();
    const db = env?.DB;
    
    if (!db) {
      // In development, just return success
      return NextResponse.json({ 
        success: true, 
        message: 'Updated in development mode' 
      });
    }

    // Update the record in the database
    const query = `UPDATE texts_bc SET ${field} = ? WHERE id = ?`;
    await db.prepare(query).bind(value, id).run();
    
    // Fetch the updated record
    const updated = await db
      .prepare('SELECT * FROM texts_bc WHERE id = ?')
      .bind(id)
      .first();
    
    return NextResponse.json({ 
      success: true, 
      data: updated 
    });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update message' 
      },
      { status: 500 }
    );
  }
}