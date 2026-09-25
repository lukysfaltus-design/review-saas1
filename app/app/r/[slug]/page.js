'use client';
import { useEffect, useState } from 'react';

const SOCIALS = [
  { key: 'instagram_url', label: 'Instagram' },
  { key: 'facebook_url', label: 'Facebook' },
  { key: 'website_url', label: 'Web' }
];

export default function ReviewPage({ params }) {
  const { slug } = params;
  const [biz, setBiz] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [stars, setStars] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/business/' + slug)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(setBiz)
      .catch(() => setNotFound(true));
  }, [slug]);

  async function pick(n) {
    setStars(n);
    if (n >= 4) {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, stars: n })
      });
      window.location.href = biz.google_review_url;
      return;
    }
    setShowForm(true);
  }

  async function submitFeedback(e) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, stars, name, message })
    });
    setSaving(false);
    setSent(true);
  }

  if (notFound) return <div className="wrap"><div className="card">Tuto stránku jsme nenašli.</div></div>;
  if (!biz) return <div className="wrap"><div className="card">Načítám…</div></div>;

  const accent = biz.accent_color || '#2F7DFF';
  const socials = SOCIALS.filter(s => biz[s.key]);

  return (
    <div className="wrap" style={{ '--accent': accent }}>
      <div className="card">
        {biz.logo_url && (
          <img
            src={biz.logo_url}
            alt={biz.name + ' logo'}
            style={{ display: 'block', maxWidth: 160, maxHeight: 90, objectFit: 'contain', margin: '0 auto 14px' }}
          />
        )}
        <h1 style={{ textAlign: 'center' }}>{biz.name}</h1>

        {!showForm && !sent && (
          <>
            <p className="sub" style={{ textAlign: 'center' }}>Jak byste ohodnotili vaši dnešní návštěvu?</p>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  className={'star' + (n <= stars ? ' active' : '')}
                  onClick={() => pick(n)}
                  aria-label={n + ' hvězdiček'}
                  style={n <= stars ? { color: accent } : undefined}
                >★</button>
              ))}
            </div>
          </>
        )}

        {showForm && !sent && (
          <form onSubmit={submitFeedback}>
            <p className="sub">Je nám líto, že to dnes nebylo stoprocentní. Napište nám prosím, co se stalo — majitel to uvidí přímo.</p>
            <input
              type="text"
              placeholder="Vaše jméno (nepovinné)"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <textarea
              rows="4"
              placeholder="Co bychom měli zlepšit?"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
            <button className="primary" type="submit" disabled={saving} style={{ background: accent }}>
              {saving ? 'Odesílám…' : 'Odeslat zprávu'}
            </button>
          </form>
        )}

        {sent && <p style={{ textAlign: 'center' }}>Díky za zpětnou vazbu, předáme ji dál majiteli.</p>}

        {socials.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            {socials.map(s => (
              <a
                key={s.key}
                href={biz[s.key]}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13, fontWeight: 700, textDecoration: 'none', color: accent,
                  border: '1px solid var(--line)', borderRadius: 999, padding: '6px 14px'
                }}
              >{s.label}</a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
