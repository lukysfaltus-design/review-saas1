'use client';
import { useEffect, useState } from 'react';
import { T, detectLang } from '@/lib/i18n';
import LangToggle from '../../LangToggle';

const SOCIALS = ['instagram_url', 'facebook_url', 'website_url'];
const SOCIAL_KEY = { instagram_url: 'instagram', facebook_url: 'facebook', website_url: 'website' };

export default function ReviewPage({ params }) {
  const { slug } = params;
  const [lang, setLang] = useState('cs');
  const [biz, setBiz] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [stars, setStars] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLang(detectLang()); }, []);

  useEffect(() => {
    fetch('/api/business/' + slug)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(setBiz)
      .catch(() => setNotFound(true));
  }, [slug]);

  const t = T[lang].review;
  const c = T[lang].common;

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

  if (notFound) return <div className="wrap"><div className="card">{c.notFound}</div></div>;
  if (!biz) return <div className="wrap"><div className="card">{c.loading}</div></div>;

  const accent = biz.accent_color || '#2F7DFF';
  const socials = SOCIALS.filter(k => biz[k]);

  return (
    <div className="wrap" style={{ '--accent': accent }}>
      <div className="card">
        <LangToggle lang={lang} setLang={setLang} />

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
            <p className="sub" style={{ textAlign: 'center' }}>{t.question}</p>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  className={'star' + (n <= stars ? ' active' : '')}
                  onClick={() => pick(n)}
                  aria-label={n + ' / 5'}
                  style={n <= stars ? { color: accent } : undefined}
                >★</button>
              ))}
            </div>
          </>
        )}

        {showForm && !sent && (
          <form onSubmit={submitFeedback}>
            <p className="sub">{t.sorry}</p>
            <input
              type="text"
              placeholder={t.namePlaceholder}
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <textarea
              rows="4"
              placeholder={t.messagePlaceholder}
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
            <button className="primary" type="submit" disabled={saving} style={{ background: accent }}>
              {saving ? t.sending : t.send}
            </button>
          </form>
        )}

        {sent && <p style={{ textAlign: 'center' }}>{t.thanks}</p>}

        {socials.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            {socials.map(k => (
              <a
                key={k}
                href={biz[k]}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13, fontWeight: 700, textDecoration: 'none', color: accent,
                  border: '1px solid var(--line)', borderRadius: 999, padding: '6px 14px'
                }}
              >{c[SOCIAL_KEY[k]]}</a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
