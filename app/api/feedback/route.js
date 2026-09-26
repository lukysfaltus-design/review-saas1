import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { resendClient } from '@/lib/resend';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';


export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const { slug, stars, name, message } = body;
  const starsNum = Number(stars);
  if (!slug || !starsNum || starsNum < 1 || starsNum > 5) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: biz } = await db.from('businesses').select('id, name').eq('slug', slug).single();
  if (!biz) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await db.from('feedback').insert({
    business_id: biz.id,
    stars: starsNum,
    customer_name: name || null,
    message: message || null
  });

  // Pokud je to zpráva (méně než 5 hvězd), pošleme rovnou e-mail nám.
  if (message) {
    try {
      const resend = resendClient();
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: process.env.NOTIFY_EMAIL,
        subject: 'Nová zpráva — ' + biz.name,
        html: `
          <div style="font-family:sans-serif">
            <p><strong>Firma:</strong> ${biz.name}</p>
            <p><strong>Jméno zákazníka:</strong> ${name || 'Neuvedeno'}</p>
            <p><strong>Zpráva:</strong></p>
            <p>${message}</p>
          </div>
        `
      });
    } catch (err) {
      // Zápis do databáze proběhl i kdyby e-mail selhal, takže jen zalogujeme.
      console.error('Notifikační e-mail se nepodařilo odeslat', err);
    }
  }

  return NextResponse.json({ ok: true });
}
