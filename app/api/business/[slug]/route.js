import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';


export async function GET(req, { params }) {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('businesses')
    .select('name, google_review_url, logo_url, instagram_url, facebook_url, website_url, accent_color')
    .eq('slug', params.slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}
