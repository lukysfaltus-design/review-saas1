import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req, { params }) {
  const db = supabaseAdmin();
  const { data: biz } = await db.from('businesses').select('id, name, slug').eq('slug', params.slug).single();
  if (!biz) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { data: categories } = await db
    .from('menu_categories')
    .select('*')
    .eq('business_id', biz.id)
    .order('sort_order', { ascending: true });

  const { data: items } = await db
    .from('menu_items')
    .select('*')
    .in('category_id', (categories || []).map(c => c.id))
    .order('sort_order', { ascending: true });

  const withItems = (categories || []).map(c => ({
    ...c,
    items: (items || []).filter(i => i.category_id === c.id)
  }));

  return NextResponse.json({ business: biz, categories: withItems });
}
