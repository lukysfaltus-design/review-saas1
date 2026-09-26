import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';


export async function GET(req, { params }) {
  const db = supabaseAdmin();
  const { data: biz } = await db.from('businesses').select('id, name').eq('slug', params.slug).single();
  if (!biz) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { data: fb } = await db
    .from('feedback')
    .select('*')
    .eq('business_id', biz.id)
    .order('created_at', { ascending: false });

  const rows = fb || [];
  const esc = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const header = 'datum;hvezdy;jmeno;zprava;vyreseno';
  const lines = rows.map(r => [
    new Date(r.created_at).toLocaleString('cs-CZ'),
    r.stars,
    esc(r.customer_name || ''),
    esc(r.message || ''),
    r.resolved ? 'ano' : 'ne'
  ].join(';'));

  // BOM na začátku, ať Excel správně zobrazí české znaky
  const csv = '\uFEFF' + [header, ...lines].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${params.slug}-zpravy.csv"`
    }
  });
}
