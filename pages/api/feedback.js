import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { resend } from '../../lib/resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { slug, rating, message, tags } = req.body;
  if (!slug || !rating) return res.status(400).json({ error: 'Chybí data.' });

  const { data: business, error: bErr } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (bErr || !business) return res.status(404).json({ error: 'Firma nenalezena.' });

  const { data: fb, error } = await supabaseAdmin
    .from('feedback')
    .insert([
      {
        business_id: business.id,
        rating,
        message: message || null,
        tags: tags || [],
      },
    ])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Nízké hodnocení => e-mail majiteli TÉTO konkrétní firmy (ne sdílená adresa!)
  if (rating < 5 && business.notify_email) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: business.notify_email,
        subject: `Nová zpětná vazba (${rating}★) – ${business.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px;">
            <h2 style="color:#14213D;">Nové hodnocení: ${rating} / 5 ★</h2>
            <p><strong>Firma:</strong> ${business.name}</p>
            ${tags && tags.length ? `<p><strong>Kategorie:</strong> ${tags.join(', ')}</p>` : ''}
            <p><strong>Zpráva od zákazníka:</strong></p>
            <p style="background:#F1EFE9; padding:12px; border-radius:6px;">${
              message ? message.replace(/\n/g, '<br/>') : '(zákazník nenapsal zprávu)'
            }</p>
            <p style="color:#6B7280; font-size:13px;">Tato zpráva NEBYLA zveřejněna na Google – je určená jen vám.</p>
          </div>
        `,
      });
    } catch (e) {
      console.error('Resend error:', e);
    }
  }

  return res.status(200).json({ ok: true, id: fb.id });
}
