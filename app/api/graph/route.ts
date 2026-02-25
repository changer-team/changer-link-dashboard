import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
  }

  try {
    const client = await db.connect();
    
    // Fetch nodes (pages)
    const nodesResult = await client.query(
      'SELECT url as id, title, h1, eeat_score FROM pages WHERE client_id = $1',
      [clientId]
    );
    
    // Fetch links
    const linksResult = await client.query(
      'SELECT source_url as source, target_url as target, anchor_text, is_menu_link FROM links WHERE client_id = $1',
      [clientId]
    );

    return NextResponse.json({
      nodes: nodesResult.rows,
      links: linksResult.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
