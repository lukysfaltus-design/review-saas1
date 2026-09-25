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

export default function BusinessForm({ initial, onSubmit, submitLabel, editing }) {
  const [form, setForm] = useState({
    name: '', slug: '', google_review_url: '', owner_email: '',
    logo_url: '', instagram_url: '', facebook_url: '', website_url: '',
    accent_color: '#2F7DFF',
    ...(initial || {})
  });
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  function upd(k, v) {
    setForm(f => ({ ...f, [k]: v }));
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
      {err && <p className="err">{err}</p>}
      <button className="primary" type="submit" disabled={saving}>
        {saving ? 'Ukládám…' : submitLabel}
      </button>
    </form>
  );
}
