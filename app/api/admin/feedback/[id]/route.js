import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';


export async function PATCH(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const resolved = !!body.resolved;

  const db = supabaseAdmin();
  const { error } = await db.from('feedback').update({
    resolved,
    resolved_at: resolved ? new Date().toISOString() : null
  }).eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
