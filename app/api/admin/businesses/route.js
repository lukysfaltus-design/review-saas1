import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('businesses')
    .select('name, slug')
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data || []);
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const { name, slug, google_review_url, owner_email, logo_url, instagram_url, facebook_url, website_url, accent_color } = body;
  if (!name || !slug || !google_review_url || !owner_email) {
    return NextResponse.json({ error: 'Vyplňte prosím povinná pole.' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { error } = await db.from('businesses').insert({
    name, slug, google_review_url, owner_email,
    logo_url: logo_url || null,
    instagram_url: instagram_url || null,
    facebook_url: facebook_url || null,
    website_url: website_url || null,
    accent_color: accent_color || '#2F7DFF'
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
