import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

export default function NfcPage() {
  const [businesses, setBusinesses] = useState([]);
  const [selected, setSelected] = useState('');
  const [status, setStatus] = useState('');
  const [url, setUrl] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    fetch('/api/admin/businesses')
      .then((r) => r.json())
      .then((data) => setBusinesses(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    const business = businesses.find((b) => b.id === selected);
    if (business && typeof window !== 'undefined') {
      setUrl(`${window.location.origin}/r/${business.slug}`);
    } else {
      setUrl('');
    }
  }, [selected, businesses]);

  useEffect(() => {
    if (url && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 220, margin: 1 });
    }
  }, [url]);

  async function writeNfc() {
    if (!url) {
      setStatus('Nejdřív vyberte klienta.');
      return;
    }
    if (typeof window === 'undefined' || !('NDEFReader' in window)) {
      setStatus('Zápis NFC funguje jen v Chrome na Androidu (na počítači ani iPhonu ne).');
      return;
    }
    try {
      const ndef = new window.NDEFReader();
      setStatus('Přiložte NFC kartu k zadní straně telefonu…');
      await ndef.write({ records: [{ recordType: 'url', data: url }] });
      setStatus('✅ Úspěšně zapsáno!');
    } catch (e) {
      setStatus('Chyba při zápisu: ' + e.message);
    }
  }

  return (
    <div className="admin-wrap narrow">
      <a href="/admin" className="back-link">
        ← Zpět na seznam
      </a>
      <h1>Zapsat NFC kartu / QR kód</h1>
      <div className="form-card">
        <label>
          Vyberte klienta
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">— vyberte —</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        {url && (
          <div className="nfc-preview">
            <p className="hint">Odkaz, který se zapíše:</p>
            <code>{url}</code>

            <div className="qr-wrap">
              <canvas ref={canvasRef} />
              <p className="hint">
                QR kód si můžete stáhnout (pravé tlačítko myši → Uložit obrázek) a vytisknout na
                stůl nebo výlohu jako alternativu k NFC kartě.
              </p>
            </div>

            <button className="btn" onClick={writeNfc}>
              Zapsat NFC kartu
            </button>
            {status && <p className="status">{status}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
