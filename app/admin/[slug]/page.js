import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function BusinessDetail({ params }) {
  const db = supabaseAdmin();
  const { data: biz } = await db.from('businesses').select('*').eq('slug', params.slug).single();

  if (!biz) {
    return <div className="wrap"><div className="card">Tohoto klienta jsme nenašli.</div></div>;
  }

  const { data: fb } = await db
    .from('feedback')
    .select('*')
    .eq('business_id', biz.id)
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="wrap">
      <div className="card">
        <h1>{biz.name}</h1>
        <p className="sub">
          Recenzní odkaz pro tuto firmu: <code>/r/{biz.slug}</code><br />
          Zprávy chodí na: {biz.owner_email}<br />
          <a href={'/admin/' + biz.slug + '/edit'}>Upravit logo, sociální sítě a barvu →</a>
        </p>
        <table>
          <thead><tr><th>Datum</th><th>Hvězdy</th><th>Jméno</th><th>Zpráva</th></tr></thead>
          <tbody>
            {(fb || []).length === 0 && (
              <tr><td colSpan="4" className="sub">Zatím žádná hodnocení.</td></tr>
            )}
            {(fb || []).map(r => (
              <tr key={r.id}>
                <td>{new Date(r.created_at).toLocaleDateString('cs-CZ')}</td>
                <td><span className={'badge ' + (r.stars >= 4 ? 'good' : 'bad')}>{r.stars}★</span></td>
                <td>{r.customer_name || '—'}</td>
                <td>{r.message || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
