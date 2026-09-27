import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const withStats = await Promise.all(
      (data || []).map(async (b) => {
        const { data: recent } = await supabaseAdmin
          .from('feedback')
          .select('rating')
          .eq('business_id', b.id)
          .gte('created_at', since);

        const { data: all } = await supabaseAdmin
          .from('feedback')
          .select('rating')
          .eq('business_id', b.id);

        const avg =
          all && all.length
            ? (all.reduce((s, r) => s + r.rating, 0) / all.length).toFixed(1)
            : null;

        return { ...b, last7: recent ? recent.length : 0, avgRating: avg };
      })
    );

    return res.status(200).json(withStats);
  }

  if (req.method === 'POST') {
    const { name, slug, google_review_link, notify_email, plan, brand_color } = req.body;

    if (!name || !slug || !google_review_link || !notify_email) {
      return res.status(400).json({ error: 'Vyplňte prosím všechna povinná pole.' });
    }

    const finalPlan = plan || 'nfc';

    const { data, error } = await supabaseAdmin
      .from('businesses')
      .insert([
        {
          name,
          slug,
          google_review_link,
          notify_email,
          plan: finalPlan,
          brand_color: brand_color || '#2563eb',
          weekly_digest: finalPlan === 'weekly',
          monthly_digest: finalPlan === 'monthly',
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.message.includes('duplicate') || error.code === '23505') {
        return res.status(400).json({ error: 'Tento slug už existuje, zvolte jiný.' });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  res.status(405).end();
}
