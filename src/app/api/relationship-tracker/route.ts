import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB;

    const query = `SELECT id, name, partner_name, start_date FROM relationship_tracker ORDER BY id`;
    const result = await db.prepare(query).all();
    const rows = (result.results || []) as any[];

    const data = rows.map(row => ({
      id: Number(row.id),
      header: row.name ?? '',
      type: row.partner_name ?? '',
      status: row.start_date ?? '',
      target: '',
      limit: '',
      reviewer: ''
    }));

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Relationship tracker API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch relationship tracker data' },
      { status: 500 }
    );
  }
}
