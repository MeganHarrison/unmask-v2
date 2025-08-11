import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing message ID' },
        { status: 400 }
      );
    }

    const { env } = await getCloudflareContext();
    const db = env?.DB;
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 503 });
    }

    // Delete the message from the database
    const query = `DELETE FROM "texts-bc" WHERE id = ?`;
    const result = await db.prepare(query).bind(parseInt(id)).run();
    
    if (result.meta.changes === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Message not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Message deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete message' 
      },
      { status: 500 }
    );
  }
}