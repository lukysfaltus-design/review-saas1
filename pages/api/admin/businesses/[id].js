import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const { data: business, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !business) return res.status(404).json({ error: 'Klient nenalezen.' });

    const { data: feedback } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .eq('business_id', id)
      .order('created_at', { ascending: false });

    return res.status(200).json({ business, feedback: feedback || [] });
  }

  if (req.method === 'PATCH') {
    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await supabaseAdmin
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin.from('businesses').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
