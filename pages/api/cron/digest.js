import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { resend } from '../../../lib/resend';

export default async function handler(req, res) {
  const now = new Date();
  const isMonday = now.getUTCDay() === 1;
  const isFirstOfMonth = now.getUTCDate() === 1;

  if (!isMonday && !isFirstOfMonth) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  const { data: businesses } = await supabaseAdmin.from('businesses').select('*');
  let sent = 0;

  for (const b of businesses || []) {
    const shouldSendWeekly = b.weekly_digest && isMonday;
    const shouldSendMonthly = b.monthly_digest && isFirstOfMonth;
    if (!shouldSendWeekly && !shouldSendMonthly) continue;

    const days = shouldSendMonthly ? 30 : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: items } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .eq('business_id', b.id)
      .gte('created_at', since);

    if (!items || items.length === 0) continue;

    const avg = (items.reduce((s, i) => s + i.rating, 0) / items.length).toFixed(1);
    const tagCounts = {};
    items.forEach((i) => (i.tags || []).forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1)));
    const topTags = Object.entries(tagCounts).sort((a, b2) => b2[1] - a[1]).slice(0, 5);
    const negatives = items.filter((i) => i.rating < 4 && i.message);

    const label = shouldSendMonthly ? 'Měsíční' : 'Týdenní';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px;">
        <h2 style="color:#14213D;">${label} přehled – ${b.name}</h2>
        <p>Počet hodnocení: <strong>${items.length}</strong>, průměr: <strong>${avg} / 5 ★</strong></p>
        ${
          topTags.length
            ? `<p><strong>Nejčastější stížnosti:</strong><br/>${topTags
                .map(([t, c]) => `${t} (${c}×)`)
                .join('<br/>')}</p>`
            : ''
        }
        ${
          negatives.length
            ? `<p><strong>Vybrané komentáře zákazníků:</strong></p><ul>${negatives
                .slice(0, 10)
                .map((n) => `<li>${n.rating}★ – ${n.message}</li>`)
                .join('')}</ul>`
            : '<p>Žádné negativní komentáře s textem za dané období.</p>'
        }
      </div>
    `;

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: b.notify_email,
        subject: `${label} shrnutí – ${b.name}`,
        html,
      });
      sent++;
    } catch (e) {
      console.error('Digest send error for', b.name, e);
    }
  }

  res.status(200).json({ ok: true, sent });
}
