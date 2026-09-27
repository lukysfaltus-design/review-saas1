import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function BusinessDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [business, setBusiness] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState('');

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/businesses/${id}`);
    const data = await res.json();
    setBusiness(data.business);
    setFeedback(data.feedback || []);
    setLoading(false);
    if (typeof window !== 'undefined' && data.business) {
      setLink(`${window.location.origin}/r/${data.business.slug}`);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/admin/businesses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(business),
    });
    setSaving(false);
    load();
  }

  async function toggleResolved(fid, resolved) {
    await fetch(`/api/admin/feedback/${fid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved }),
    });
    setFeedback((fb) => fb.map((x) => (x.id === fid ? { ...x, resolved } : x)));
  }

  if (loading || !business) {
    return (
      <div className="admin-wrap">
        <p>Načítání…</p>
      </div>
    );
  }

  const last7days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().slice(0, 10);
    const count = feedback.filter((f) => f.created_at.slice(0, 10) === dayStr).length;
    return { day: d.toLocaleDateString('cs-CZ', { weekday: 'short' }), count };
  });
  const maxCount = Math.max(1, ...last7days.map((d) => d.count));

  return (
    <div className="admin-wrap">
      <Link href="/admin" className="back-link">
        ← Zpět na seznam
      </Link>
      <h1>{business.name}</h1>

      <div className="detail-grid">
        <form onSubmit={handleSave} className="form-card">
          <h3>Nastavení</h3>
          <label>
            Název
            <input
              value={business.name}
              onChange={(e) => setBusiness({ ...business, name: e.target.value })}
            />
          </label>
          <label>
            Google recenze – odkaz
            <input
              value={business.google_review_link || ''}
              onChange={(e) => setBusiness({ ...business, google_review_link: e.target.value })}
            />
          </label>
          <label>
            E-mail majitele
            <input
              value={business.notify_email || ''}
              onChange={(e) => setBusiness({ ...business, notify_email: e.target.value })}
            />
          </label>
          <label>
            Balíček
            <select
              value={business.plan}
              onChange={(e) => {
                const plan = e.target.value;
                setBusiness({
                  ...business,
                  plan,
                  weekly_digest: plan === 'weekly',
                  monthly_digest: plan === 'monthly',
                });
              }}
            >
              <option value="nfc">Jen NFC karta</option>
              <option value="monthly">Review systém – měsíční</option>
              <option value="weekly">Review systém – týdenní</option>
            </select>
          </label>
          <label>
            Status
            <select
              value={business.status}
              onChange={(e) => setBusiness({ ...business, status: e.target.value })}
            >
              <option value="trial">Trial</option>
              <option value="active">Aktivní</option>
              <option value="inactive">Neaktivní</option>
              <option value="cancelled">Ukončeno</option>
            </select>
          </label>
          <label>
            Barva značky
            <input
              type="color"
              value={business.brand_color || '#2563eb'}
              onChange={(e) => setBusiness({ ...business, brand_color: e.target.value })}
            />
          </label>
          <button className="btn" disabled={saving}>
            {saving ? 'Ukládám…' : 'Uložit změny'}
          </button>
        </form>

        <div className="side-panel">
          <div className="link-box">
            <p className="hint">Odkaz pro klienta:</p>
            <code>{link}</code>
            <button
              className="btn btn-secondary"
              onClick={() => {
                navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? 'Zkopírováno ✓' : 'Kopírovat odkaz'}
            </button>
            <Link href="/admin/nfc" className="btn btn-secondary">
              Zapsat NFC kartu
            </Link>
            <a className="btn btn-secondary" href={`/api/admin/export/${id}`}>
              Export CSV
            </a>
          </div>

          <div className="chart-box">
            <p className="hint">Hodnocení za posledních 7 dní</p>
            <div className="bar-chart">
              {last7days.map((d, i) => (
                <div key={i} className="bar-col">
                  <div className="bar" style={{ height: `${(d.count / maxCount) * 80}px` }} />
                  <span>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h3>Zpětná vazba ({feedback.length})</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Hodnocení</th>
            <th>Kategorie</th>
            <th>Zpráva</th>
            <th>Vyřešeno</th>
          </tr>
        </thead>
        <tbody>
          {feedback.map((f) => (
            <tr key={f.id}>
              <td>{new Date(f.created_at).toLocaleString('cs-CZ')}</td>
              <td>
                {'★'.repeat(f.rating)}
                {'☆'.repeat(5 - f.rating)}
              </td>
              <td>{(f.tags || []).join(', ') || '—'}</td>
              <td>{f.message || '—'}</td>
              <td>
                <input
                  type="checkbox"
                  checked={!!f.resolved}
                  onChange={(e) => toggleResolved(f.id, e.target.checked)}
                />
              </td>
            </tr>
          ))}
          {feedback.length === 0 && (
            <tr>
              <td colSpan={5} className="empty">
                Zatím žádná zpětná vazba.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
