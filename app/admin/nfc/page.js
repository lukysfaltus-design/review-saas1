'use client';
import { useEffect, useState } from 'react';

export default function NfcWriter() {
  const [businesses, setBusinesses] = useState([]);
  const [slug, setSlug] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [mode, setMode] = useState('pick');
  const [target, setTarget] = useState('review');
  const [status, setStatus] = useState('idle');
  const [log, setLog] = useState('');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'NDEFReader' in window);
    fetch('/api/admin/businesses')
      .then(r => r.json())
      .then(list => {
        setBusinesses(list);
        if (list.length) setSlug(list[0].slug);
      })
      .catch(() => {});
  }, []);

  function targetUrl() {
    if (mode === 'custom') return customUrl.trim();
    if (!slug) return '';
    const path = target === 'hub' ? '/c/' : '/r/';
    return window.location.origin + path + slug;
  }

  async function writeTag() {
    const url = targetUrl();
    if (!url) {
      setLog('Nejdřív vyberte klienta nebo zadejte odkaz.');
      setStatus('error');
      return;
    }
    if (!supported) {
      setLog('Tento prohlížeč zápis NFC nepodporuje. Použijte Chrome na Androidu.');
      setStatus('error');
      return;
    }

    setStatus('waiting');
    setLog('Přiložte prázdnou NFC kartu k zadní straně telefonu…');

    try {
      const ndef = new window.NDEFReader();
      await ndef.write({ records: [{ recordType: 'url', data: url }] });
      setStatus('done');
      setLog('Hotovo — karta teď vede na: ' + url);
    } catch (err) {
      setStatus('error');
      if (err.name === 'NotAllowedError') {
        setLog('Zápis byl zamítnut. Povolte NFC oprávnění pro tuhle stránku a zkuste to znovu.');
      } else if (err.name === 'NotSupportedError') {
        setLog('Zařízení nemá NFC, nebo je vypnuté v nastavení telefonu.');
      } else {
        setLog('Zápis se nepovedl: ' + err.message + '. Zkuste kartu přiložit blíž a podržet ji.');
      }
    }
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>Zápis NFC karty</h1>
        <p className="sub">
          Funguje jen v Chrome na Androidu (Web NFC). Na iPhonu tohle bohužel
          nejde spustit z webové stránky — použijte samostatnou appku jako
          NFC Tools.
        </p>

        {!supported && (
          <p className="err">
            Tenhle prohlížeč/zařízení Web NFC nepodporuje. Otevřete tuhle
            stránku v Chrome na Androidu.
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button
            type="button"
            className="primary"
            style={{ opacity: mode === 'pick' ? 1 : 0.55 }}
            onClick={() => setMode('pick')}
          >Vybrat klienta</button>
          <button
            type="button"
            className="primary"
            style={{ opacity: mode === 'custom' ? 1 : 0.55 }}
            onClick={() => setMode('custom')}
          >Vlastní odkaz</button>
        </div>

        {mode === 'pick' && (
          <>
            <select
              value={slug}
              onChange={e => setSlug(e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--line)', font: 'inherit' }}
            >
              {businesses.length === 0 && <option value="">Zatím žádní klienti</option>}
              {businesses.map(b => (
                <option key={b.slug} value={b.slug}>{b.name}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, border: '1px solid var(--line)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer' }}>
                <input type="radio" checked={target === 'review'} onChange={() => setTarget('review')} />
                Jen hodnocení
              </label>
              <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, border: '1px solid var(--line)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer' }}>
                <input type="radio" checked={target === 'hub'} onChange={() => setTarget('hub')} />
                Menu + hodnocení
              </label>
            </div>
          </>
        )}

        {mode === 'custom' && (
          <input
            type="text"
            placeholder="https://…"
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
          />
        )}

        <p className="sub" style={{ marginTop: 12 }}>
          Odkaz, který se zapíše: <code>{targetUrl() || '—'}</code>
        </p>

        <button className="primary" onClick={writeTag} disabled={status === 'waiting'}>
          {status === 'waiting' ? 'Čekám na kartu…' : 'Přiložit kartu a zapsat'}
        </button>

        {log && (
          <p className={status === 'error' ? 'err' : 'sub'} style={{ marginTop: 12 }}>{log}</p>
        )}
      </div>
    </div>
  );
}
