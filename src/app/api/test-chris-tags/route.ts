import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: NextRequest) {
  try {
    const context = await getCloudflareContext();
    const db = context?.env?.DB;

    if (!db) {
      return new Response(JSON.stringify({
        error: 'Database not available'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Query 1: Check for messages with tag = 'Chris'
    const tagQuery = `
      SELECT COUNT(*) as count 
      FROM "texts-bc" 
      WHERE LOWER(tag) LIKE '%chris%'
    `;
    
    // Query 2: Get sample messages with Chris in tag
    const sampleQuery = `
      SELECT id, date_time, sender, message, tag, category
      FROM "texts-bc" 
      WHERE LOWER(tag) LIKE '%chris%'
      LIMIT 10
    `;
    
    // Query 3: Check all unique tags
    const allTagsQuery = `
      SELECT DISTINCT tag, COUNT(*) as count
      FROM "texts-bc"
      WHERE tag IS NOT NULL AND tag != ''
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 50
    `;
    
    // Query 4: Check for Chris in other fields
    const otherFieldsQuery = `
      SELECT 
        SUM(CASE WHEN LOWER(message) LIKE '%chris%' THEN 1 ELSE 0 END) as in_message,
        SUM(CASE WHEN LOWER(sender) LIKE '%chris%' THEN 1 ELSE 0 END) as in_sender,
        SUM(CASE WHEN LOWER(category) LIKE '%chris%' THEN 1 ELSE 0 END) as in_category
      FROM "texts-bc"
    `;

    const [tagCount, samples, allTags, otherFields] = await Promise.all([
      db.prepare(tagQuery).first(),
      db.prepare(sampleQuery).all(),
      db.prepare(allTagsQuery).all(),
      db.prepare(otherFieldsQuery).first()
    ]);

    return new Response(JSON.stringify({
      messagesWithChrisTag: tagCount,
      sampleMessages: samples.results,
      allUniqueTags: allTags.results,
      chrisInOtherFields: otherFields,
      totalTags: allTags.results?.length || 0
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error checking Chris tags:', error);
    return new Response(JSON.stringify({
      error: 'Failed to check tags',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}