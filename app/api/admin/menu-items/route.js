import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';


export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || !body.category_id || !body.name) {
    return NextResponse.json({ error: 'Vyplňte alespoň název položky.' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { count } = await db
    .from('menu_items')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', body.category_id);

  const { error } = await db.from('menu_items').insert({
    category_id: body.category_id,
    name: body.name,
    description: body.description || null,
    price_czk: body.price_czk ? Number(body.price_czk) : null,
    sort_order: count || 0
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
