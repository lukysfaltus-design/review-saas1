import { useState } from 'react';
import { useRouter } from 'next/router';

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function NewClient() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [googleLink, setGoogleLink] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [plan, setPlan] = useState('nfc');
  const [brandColor, setBrandColor] = useState('#2563eb');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleNameChange(v) {
    setName(v);
    if (!slugEdited) setSlug(slugify(v));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const res = await fetch('/api/admin/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug,
        google_review_link: googleLink,
        notify_email: notifyEmail,
        plan,
        brand_color: brandColor,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Něco se pokazilo.');
      return;
    }
    router.push(`/admin/business/${data.id}`);
  }

  return (
    <div className="admin-wrap narrow">
      <a href="/admin" className="back-link">
        ← Zpět na seznam
      </a>
      <h1>Nový klient</h1>
      <form onSubmit={handleSubmit} className="form-card">
        <label>
          Název firmy
          <input value={name} onChange={(e) => handleNameChange(e.target.value)} required />
        </label>
        <label>
          Slug pro odkaz
          <input
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugEdited(true);
            }}
            required
          />
          <span className="hint">Odkaz, který se zapíše: /r/{slug || '…'}</span>
        </label>
        <label>
          Odkaz na Google recenze
          <input
            value={googleLink}
            onChange={(e) => setGoogleLink(e.target.value)}
            placeholder="https://maps.google.com/?cid=..."
            required
          />
        </label>
        <label>
          E-mail majitele (kam chodí upozornění)
          <input
            type="email"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Balíček
          <select value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="nfc">Jen NFC karta</option>
            <option value="monthly">Review systém – měsíční</option>
            <option value="weekly">Review systém – týdenní</option>
          </select>
        </label>
        <label>
          Barva značky
          <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={saving}>
          {saving ? 'Ukládám…' : 'Vytvořit'}
        </button>
      </form>
    </div>
  );
}
