'use client';
import { useEffect, useState } from 'react';

export default function MenuEditor({ params }) {
  const { slug } = params;
  const [data, setData] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [itemForms, setItemForms] = useState({});
  const [err, setErr] = useState('');

  async function load() {
    const r = await fetch('/api/admin/menu/' + slug);
    if (r.ok) setData(await r.json());
  }

  useEffect(() => { load(); }, [slug]);

  async function addCategory(e) {
    e.preventDefault();
    setErr('');
    if (!newCatName.trim()) return;
    const res = await fetch('/api/admin/menu-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, name: newCatName.trim() })
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d.error || 'Nepodařilo se přidat kategorii.');
      return;
    }
    setNewCatName('');
    load();
  }

  async function deleteCategory(id) {
    if (!confirm('Smazat celou kategorii i s položkami?')) return;
    await fetch('/api/admin/menu-categories/' + id, { method: 'DELETE' });
    load();
  }

  function updateItemForm(catId, field, value) {
    setItemForms(f => ({ ...f, [catId]: { ...(f[catId] || {}), [field]: value } }));
  }

  async function addItem(catId, e) {
    e.preventDefault();
    const form = itemForms[catId] || {};
    if (!form.name || !form.name.trim()) return;
    const res = await fetch('/api/admin/menu-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id: catId,
        name: form.name.trim(),
        description: form.description || '',
        price_czk: form.price || ''
      })
    });
    if (res.ok) {
      setItemForms(f => ({ ...f, [catId]: { name: '', description: '', price: '' } }));
      load();
    }
  }

  async function deleteItem(id) {
    await fetch('/api/admin/menu-items/' + id, { method: 'DELETE' });
    load();
  }

  if (!data) return <div className="wrap"><div className="card">Načítám…</div></div>;

  return (
    <div className="wrap">
      <div className="card">
        <h1>Menu — {data.business.name}</h1>
        <p className="sub">Veřejná stránka menu: <code>/m/{data.business.slug}</code></p>

        <form onSubmit={addCategory} style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
          <input
            type="text"
            placeholder="Nová kategorie, např. Předkrmy"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            style={{ marginTop: 0, flex: 1 }}
          />
          <button className="primary" type="submit" style={{ width: 'auto', marginTop: 0 }}>+ Přidat</button>
        </form>
        {err && <p className="err">{err}</p>}

        {data.categories.length === 0 && <p className="sub">Zatím žádné kategorie.</p>}

        {data.categories.map(cat => (
          <div key={cat.id} style={{ marginTop: 20, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{cat.name}</h3>
              <button
                type="button"
                onClick={() => deleteCategory(cat.id)}
                style={{ border: 'none', background: 'none', color: '#993C1D', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >Smazat kategorii</button>
            </div>

            <table>
              <tbody>
                {cat.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="sub">{item.description}</td>
                    <td>{item.price_czk != null ? item.price_czk + ' Kč' : '—'}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        style={{ border: 'none', background: 'none', color: '#993C1D', fontSize: 12, cursor: 'pointer' }}
                      >Smazat</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <form onSubmit={e => addItem(cat.id, e)} style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Název položky"
                value={(itemForms[cat.id] || {}).name || ''}
                onChange={e => updateItemForm(cat.id, 'name', e.target.value)}
                style={{ marginTop: 0, flex: '2 1 160px' }}
              />
              <input
                type="text"
                placeholder="Popis (nepovinné)"
                value={(itemForms[cat.id] || {}).description || ''}
                onChange={e => updateItemForm(cat.id, 'description', e.target.value)}
                style={{ marginTop: 0, flex: '2 1 160px' }}
              />
              <input
                type="text"
                placeholder="Cena v Kč"
                value={(itemForms[cat.id] || {}).price || ''}
                onChange={e => updateItemForm(cat.id, 'price', e.target.value)}
                style={{ marginTop: 0, flex: '1 1 90px' }}
              />
              <button className="primary" type="submit" style={{ width: 'auto', marginTop: 0 }}>+ Položka</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
