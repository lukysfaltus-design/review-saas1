import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';


export async function GET(req, { params }) {
  const db = supabaseAdmin();
  const { data: biz } = await db
    .from('businesses')
    .select('id, name, logo_url, accent_color')
    .eq('slug', params.slug)
    .single();

  if (!biz) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { data: categories } = await db
    .from('menu_categories')
    .select('id, name, sort_order')
    .eq('business_id', biz.id)
    .order('sort_order', { ascending: true });

  const { data: items } = await db
    .from('menu_items')
    .select('id, category_id, name, description, price_czk, sort_order')
    .in('category_id', (categories || []).map(c => c.id))
    .order('sort_order', { ascending: true });

  const withItems = (categories || []).map(c => ({
    ...c,
    items: (items || []).filter(i => i.category_id === c.id)
  }));

  return NextResponse.json({
    business: { name: biz.name, logo_url: biz.logo_url, accent_color: biz.accent_color },
    categories: withItems
  });
}
