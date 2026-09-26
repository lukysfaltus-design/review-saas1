'use client';
import { useEffect, useState } from 'react';
import { T, detectLang } from '@/lib/i18n';
import LangToggle from '../../LangToggle';

export default function HubPage({ params }) {
  const { slug } = params;
  const [lang, setLang] = useState('cs');
  const [biz, setBiz] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { setLang(detectLang()); }, []);

  useEffect(() => {
    fetch('/api/business/' + slug)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(setBiz)
      .catch(() => setNotFound(true));
  }, [slug]);

  const t = T[lang].hub;
  const c = T[lang].common;

  if (notFound) return <div className="wrap"><div className="card">{c.notFound}</div></div>;
  if (!biz) return <div className="wrap"><div className="card">{c.loading}</div></div>;

  const accent = biz.accent_color || '#2F7DFF';

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
          <a
            href={'/m/' + slug}
            style={{
              display: 'block', textAlign: 'center', padding: '18px', borderRadius: 14,
              background: accent, color: '#fff', fontWeight: 700, fontSize: 17, textDecoration: 'none'
            }}
          >{t.menuButton}</a>
          <a
            href={'/r/' + slug}
            style={{
              display: 'block', textAlign: 'center', padding: '18px', borderRadius: 14,
              border: '2px solid var(--line)', color: 'var(--ink)', fontWeight: 700, fontSize: 17, textDecoration: 'none'
            }}
          >{t.rateButton}</a>
        </div>
      </div>
    </div>
  );
}
