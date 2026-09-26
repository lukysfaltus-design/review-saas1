import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const db = supabaseAdmin();
  const { error } = await db.from('menu_items').update({
    name: body.name,
    description: body.description || null,
    price_czk: body.price_czk ? Number(body.price_czk) : null
  }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const db = supabaseAdmin();
  const { error } = await db.from('menu_items').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
