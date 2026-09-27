import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const { id } = req.query;

  const { data: feedback, error } = await supabaseAdmin
    .from('feedback')
    .select('*')
    .eq('business_id', id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  const header = 'Datum,Hodnoceni,Kategorie,Zprava,Vyreseno\n';
  const rows = (feedback || [])
    .map((f) => {
      const date = new Date(f.created_at).toLocaleString('cs-CZ');
      const tags = (f.tags || []).join('; ');
      const msg = (f.message || '').replace(/"/g, '""').replace(/\n/g, ' ');
      return `"${date}",${f.rating},"${tags}","${msg}",${f.resolved ? 'Ano' : 'Ne'}`;
    })
    .join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=feedback-export.csv');
  res.status(200).send('\uFEFF' + header + rows);
}
