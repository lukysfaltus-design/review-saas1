import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || !body.slug || !body.name) {
    return NextResponse.json({ error: 'Vyplňte název kategorie.' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: biz } = await db.from('businesses').select('id').eq('slug', body.slug).single();
  if (!biz) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { count } = await db
    .from('menu_categories')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', biz.id);

  const { error } = await db.from('menu_categories').insert({
    business_id: biz.id,
    name: body.name,
    sort_order: count || 0
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
