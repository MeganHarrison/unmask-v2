import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface RelationshipEvent {
  id?: number;
  event_date: string;
  event_time?: string;
  event_type: string;
  title: string;
  description?: string;
  notes?: string;
  category?: string;
  sentiment?: string;
  significance?: number;
  initiated_by?: string;
  location?: string;
  mood_before?: string;
  mood_after?: string;
  relationship_id?: number;
  created_at?: string;
  updated_at?: string;
}

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

    const url = new URL(request.url);
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const eventType = url.searchParams.get('event_type');
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const page = parseInt(url.searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    if (startDate && endDate) {
      whereConditions.push('event_date >= ? AND event_date <= ?');
      queryParams.push(startDate, endDate);
    }

    if (eventType) {
      whereConditions.push('event_type = ?');
      queryParams.push(eventType);
    }

    if (category) {
      whereConditions.push('category = ?');
      queryParams.push(category);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM relationship_events 
      ${whereClause}
    `;
    
    const countResult = await db.prepare(countQuery).bind(...queryParams).first();
    const total = (countResult as any)?.total || 0;

    // Get events
    const query = `
      SELECT 
        id,
        event_date,
        event_time,
        event_type,
        title,
        description,
        notes,
        category,
        sentiment,
        significance,
        initiated_by,
        location,
        mood_before,
        mood_after,
        relationship_id,
        created_at,
        updated_at,
        CAST(julianday('now') - julianday(event_date) AS INTEGER) as days_ago
      FROM relationship_events 
      ${whereClause}
      ORDER BY event_date DESC, event_time DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);
    const result = await db.prepare(query).bind(...queryParams).all();
    const events = result.results as unknown as RelationshipEvent[];

    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching relationship events:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch events'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getCloudflareContext();
    const db = context?.env?.DB;

    if (!db) {
      console.error('Database not available - D1 binding not found');
      return NextResponse.json({
        success: false,
        error: 'Database not available - D1 binding not found'
      }, { status: 500 });
    }

    const body = await request.json();
    console.log('Creating event with data:', body);
    const {
      event_date,
      event_time,
      event_type,
      title,
      description,
      notes,
      category = 'general',
      sentiment = 'neutral',
      significance = 3,
      initiated_by,
      location,
      mood_before,
      mood_after,
      relationship_id = 1
    } = body;

    // Validate required fields
    if (!event_date || !event_type || !title) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: event_date, event_type, title'
      }, { status: 400 });
    }

    const query = `
      INSERT INTO relationship_events (
        event_date, event_time, event_type, title, description, notes,
        category, sentiment, significance, initiated_by, location,
        mood_before, mood_after, relationship_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    console.log('Executing INSERT query...');
    
    let result;
    try {
      result = await db.prepare(query).bind(
        event_date,
        event_time || null,
        event_type,
        title,
        description || null,
        notes || null,
        category,
        sentiment,
        significance,
        initiated_by || null,
        location || null,
        mood_before || null,
        mood_after || null,
        relationship_id
      ).run();
      console.log('Insert result:', result);
    } catch (dbError) {
      console.error('Database error during insert:', dbError);
      return NextResponse.json({
        success: false,
        error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`
      }, { status: 500 });
    }

    // Get the created event
    const newEvent = await db.prepare('SELECT * FROM relationship_events WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();

    return NextResponse.json({
      success: true,
      data: newEvent
    });

  } catch (error) {
    console.error('Error creating relationship event:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create event'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const context = await getCloudflareContext();
    const db = context?.env?.DB;

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Event ID is required'
      }, { status: 400 });
    }

    // Build dynamic update query
    const updateFields = Object.keys(updateData)
      .filter(key => updateData[key] !== undefined)
      .map(key => `${key} = ?`);
    
    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    const values = Object.values(updateData).filter(v => v !== undefined);
    values.push(id);

    const query = `
      UPDATE relationship_events 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await db.prepare(query).bind(...values).run();

    // Get the updated event
    const updatedEvent = await db.prepare('SELECT * FROM relationship_events WHERE id = ?')
      .bind(id)
      .first();

    if (!updatedEvent) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedEvent
    });

  } catch (error) {
    console.error('Error updating relationship event:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update event'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const context = await getCloudflareContext();
    const db = context?.env?.DB;

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Event ID is required'
      }, { status: 400 });
    }

    // Check if event exists
    const existingEvent = await db.prepare('SELECT id FROM relationship_events WHERE id = ?')
      .bind(parseInt(id))
      .first();

    if (!existingEvent) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 });
    }

    await db.prepare('DELETE FROM relationship_events WHERE id = ?')
      .bind(parseInt(id))
      .run();

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting relationship event:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete event'
    }, { status: 500 });
  }
}