'use client';
import { useEffect, useState } from 'react';

const T = {
  cs: {
    question: 'Jak byste ohodnotili vaši dnešní návštěvu?',
    sorry: 'Je nám líto, že to dnes nebylo stoprocentní. Napište nám prosím, co se stalo — majitel to uvidí přímo.',
    namePlaceholder: 'Vaše jméno (nepovinné)',
    messagePlaceholder: 'Co bychom měli zlepšit?',
    sending: 'Odesílám…',
    send: 'Odeslat zprávu',
    thanks: 'Díky za zpětnou vazbu, předáme ji dál majiteli.',
    notFound: 'Tuto stránku jsme nenašli.',
    loading: 'Načítám…',
    instagram: 'Instagram',
    facebook: 'Facebook',
    website: 'Web'
  },
  en: {
    question: 'How would you rate your visit today?',
    sorry: "We're sorry today wasn't perfect. Please tell us what happened — the owner will see it directly.",
    namePlaceholder: 'Your name (optional)',
    messagePlaceholder: 'What should we improve?',
    sending: 'Sending…',
    send: 'Send message',
    thanks: "Thanks for the feedback, we'll pass it on to the owner.",
    notFound: "We couldn't find this page.",
    loading: 'Loading…',
    instagram: 'Instagram',
    facebook: 'Facebook',
    website: 'Website'
  }
};

const SOCIALS = [
  { key: 'instagram_url', label: 'instagram' },
  { key: 'facebook_url', label: 'facebook' },
  { key: 'website_url', label: 'website' }
];

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

  useEffect(() => {
    const browserLang = typeof navigator !== 'undefined' ? navigator.language : '';
    if (browserLang && !browserLang.toLowerCase().startsWith('cs') && !browserLang.toLowerCase().startsWith('sk')) {
      setLang('en');
    }
  }, []);

  useEffect(() => {
    fetch('/api/business/' + slug)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(setBiz)
      .catch(() => setNotFound(true));
  }, [slug]);

  const t = T[lang];

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

  if (notFound) return <div className="wrap"><div className="card">{t.notFound}</div></div>;
  if (!biz) return <div className="wrap"><div className="card">{t.loading}</div></div>;

  const accent = biz.accent_color || '#2F7DFF';
  const socials = SOCIALS.filter(s => biz[s.key]);

  return (
    <div className="wrap" style={{ '--accent': accent }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <button
            type="button"
            onClick={() => setLang(l => (l === 'cs' ? 'en' : 'cs'))}
            style={{
              border: '1px solid var(--line)', borderRadius: 999, padding: '4px 12px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'transparent', color: 'var(--muted)'
            }}
          >{lang === 'cs' ? 'EN' : 'CZ'}</button>
        </div>

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
              >{t[s.label]}</a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
