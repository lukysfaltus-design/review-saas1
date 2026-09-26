'use client';
import { useEffect, useState } from 'react';
import { T, detectLang } from '@/lib/i18n';
import LangToggle from '../../LangToggle';

export default function MenuPage({ params }) {
  const { slug } = params;
  const [lang, setLang] = useState('cs');
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { setLang(detectLang()); }, []);

  useEffect(() => {
    fetch('/api/menu/' + slug)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(setData)
      .catch(() => setNotFound(true));
  }, [slug]);

  const t = T[lang].menu;
  const c = T[lang].common;

  if (notFound) return <div className="wrap"><div className="card">{c.notFound}</div></div>;
  if (!data) return <div className="wrap"><div className="card">{c.loading}</div></div>;

  const accent = data.business.accent_color || '#2F7DFF';

  return (
    <div className="wrap" style={{ '--accent': accent }}>
      <div className="card">
        <LangToggle lang={lang} setLang={setLang} />

        {data.business.logo_url && (
          <img
            src={data.business.logo_url}
            alt={data.business.name + ' logo'}
            style={{ display: 'block', maxWidth: 160, maxHeight: 90, objectFit: 'contain', margin: '0 auto 14px' }}
          />
        )}
        <h1 style={{ textAlign: 'center' }}>{data.business.name}</h1>
        <p className="sub" style={{ textAlign: 'center' }}>{t.label}</p>

        {data.categories.length === 0 && (
          <p className="sub" style={{ textAlign: 'center' }}>{t.preparing}</p>
        )}

        {data.categories.map(cat => (
          <div key={cat.id} style={{ marginTop: 22 }}>
            <h3 style={{ color: accent, borderBottom: '1px solid var(--line)', paddingBottom: 6 }}>{cat.name}</h3>
            {cat.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  {item.description && <div className="sub" style={{ margin: 0 }}>{item.description}</div>}
                </div>
                {item.price_czk != null && (
                  <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{item.price_czk} Kč</div>
                )}
              </div>
            ))}
          </div>
        ))}

        <a
          href={'/r/' + slug}
          className="button"
          style={{ display: 'block', textAlign: 'center', marginTop: 24, background: accent }}
        >{t.rateButton}</a>
      </div>
    </div>
  );
}
