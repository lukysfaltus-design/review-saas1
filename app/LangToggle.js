'use client';

export default function LangToggle({ lang, setLang }) {
  return (
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
  );
}
