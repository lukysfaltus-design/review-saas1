'use client';
import { useEffect, useState } from 'react';

export default function MenuPage({ params }) {
  const { slug } = params;
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch('/api/menu/' + slug)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(setData)
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) return <div className="wrap"><div className="card">Tuto stránku jsme nenašli.</div></div>;
  if (!data) return <div className="wrap"><div className="card">Načítám…</div></div>;

  const accent = data.business.accent_color || '#2F7DFF';

  return (
    <div className="wrap" style={{ '--accent': accent }}>
      <div className="card">
        {data.business.logo_url && (
          <img
            src={data.business.logo_url}
            alt={data.business.name + ' logo'}
            style={{ display: 'block', maxWidth: 160, maxHeight: 90, objectFit: 'contain', margin: '0 auto 14px' }}
          />
        )}
        <h1 style={{ textAlign: 'center' }}>{data.business.name}</h1>
        <p className="sub" style={{ textAlign: 'center' }}>Menu</p>

        {data.categories.length === 0 && (
          <p className="sub" style={{ textAlign: 'center' }}>Menu se právě připravuje.</p>
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
        >⭐ Ohodnotit návštěvu</a>
      </div>
    </div>
  );
}
