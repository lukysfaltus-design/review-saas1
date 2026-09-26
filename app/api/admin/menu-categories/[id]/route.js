import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const db = supabaseAdmin();
  const { error } = await db.from('menu_categories').update({ name: body.name }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const db = supabaseAdmin();
  const { error } = await db.from('menu_categories').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
