import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const db = supabaseAdmin();
  const { data: businesses } = await db
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false });

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const rows = [];
  for (const b of businesses || []) {
    const { data: fb } = await db
      .from('feedback')
      .select('stars')
      .eq('business_id', b.id)
      .gte('created_at', since);
    const count = fb ? fb.length : 0;
    const avg = count ? (fb.reduce((s, r) => s + r.stars, 0) / count).toFixed(1) : '—';
    rows.push({ ...b, weekCount: count, weekAvg: avg });
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>Klienti</h1>
        <p className="sub">
          <Link className="button" href="/admin/new">+ Nový klient</Link>{' '}
          <Link className="button" href="/admin/nfc" style={{ marginLeft: 8, background: '#1E5A66' }}>Zapsat NFC kartu</Link>
        </p>
        <table>
          <thead>
            <tr><th>Firma</th><th>Za 7 dní</th><th>Průměr</th><th></th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan="4" className="sub">Zatím žádní klienti.</td></tr>
            )}
            {rows.map(b => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.weekCount}</td>
                <td>{b.weekAvg}</td>
                <td><Link href={'/admin/' + b.slug}>Detail</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
