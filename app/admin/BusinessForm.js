'use client';
import { useState } from 'react';

const FIELDS = [
  { key: 'name', label: 'Název firmy', required: true },
  { key: 'slug', label: 'Slug pro odkaz, např. kavarna-modra', required: true, lockOnEdit: true },
  { key: 'google_review_url', label: 'Odkaz na Google recenze firmy', required: true },
  { key: 'owner_email', label: 'E-mail majitele', required: true },
  { key: 'logo_url', label: 'Odkaz na logo (obrázek, https://…)', required: false },
  { key: 'instagram_url', label: 'Odkaz na Instagram', required: false },
  { key: 'facebook_url', label: 'Odkaz na Facebook', required: false },
  { key: 'website_url', label: 'Web podniku', required: false },
  { key: 'accent_color', label: 'Barva (hex, např. #2F7DFF)', required: false }
];

function resizeToDataUrl(img, maxDim = 480, quality = 0.82) {
  let { width, height } = img;
  if (width > height && width > maxDim) {
    height = Math.round(height * (maxDim / width));
    width = maxDim;
  } else if (height > maxDim) {
    width = Math.round(width * (maxDim / height));
    height = maxDim;
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

function rgbToHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function extractAccentColor(img) {
  const size = 60;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  const buckets = {};
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 100) continue;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    const saturation = max === min ? 0 : (max - min) / (255 - Math.abs(2 * lightness - 255));
    // vynecháme skoro bílou, skoro černou a šedé pixely (typicky pozadí)
    if (lightness > 235 || lightness < 20 || saturation < 0.15) continue;
    const key = [Math.round(r / 24) * 24, Math.round(g / 24) * 24, Math.round(b / 24) * 24].join(',');
    buckets[key] = (buckets[key] || 0) + 1;
  }

  let best = null, bestCount = 0;
  for (const k in buckets) {
    if (buckets[k] > bestCount) { bestCount = buckets[k]; best = k; }
  }
  if (!best) return null;
  const [r, g, b] = best.split(',').map(Number);
  return rgbToHex(r, g, b);
}

export default function BusinessForm({ initial, onSubmit, submitLabel, editing }) {
  const [form, setForm] = useState({
    name: '', slug: '', google_review_url: '', owner_email: '',
    logo_url: '', instagram_url: '', facebook_url: '', website_url: '',
    accent_color: '#2F7DFF',
    ...(initial || {})
  });
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [photoStatus, setPhotoStatus] = useState('');

  function upd(k, v) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function handlePhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPhotoStatus('Zpracovávám fotku…');

    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        try {
          const resized = resizeToDataUrl(img);
          const color = extractAccentColor(img);
          upd('logo_url', resized);
          if (color) {
            upd('accent_color', color);
            setPhotoStatus('Hotovo — nalezená barva: ' + color);
          } else {
            setPhotoStatus('Fotka nahraná, ale výraznou barvu se z ní nepodařilo najít — nastavte barvu ručně.');
          }
        } catch (ex) {
          setPhotoStatus('Fotku se nepodařilo zpracovat, zkuste jinou.');
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      await onSubmit(form);
    } catch (ex) {
      setErr(ex.message || 'Něco se pokazilo.');
    }
    setSaving(false);
  }

  return (
    <form onSubmit={submit}>
      {FIELDS.map(f => (
        <input
          key={f.key}
          type="text"
          placeholder={f.label}
          value={form[f.key] || ''}
          onChange={e => upd(f.key, e.target.value)}
          required={f.required}
          disabled={editing && f.lockOnEdit}
        />
      ))}

      <div style={{ border: '1px dashed var(--line)', borderRadius: 10, padding: 12, marginTop: 12 }}>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>
          Nebo nahrajte fotku (logo / interiér) — automaticky se z ní vytáhne logo i barva podniku
        </label>
        <input type="file" accept="image/*" onChange={handlePhoto} />
        {photoStatus && <p className="sub" style={{ marginTop: 6, marginBottom: 0 }}>{photoStatus}</p>}
        {form.logo_url && form.logo_url.startsWith('data:') && (
          <img src={form.logo_url} alt="Náhled" style={{ maxWidth: 120, maxHeight: 70, objectFit: 'contain', marginTop: 8, display: 'block' }} />
        )}
      </div>

      {err && <p className="err">{err}</p>}
      <button className="primary" type="submit" disabled={saving}>
        {saving ? 'Ukládám…' : submitLabel}
      </button>
    </form>
  );
}
