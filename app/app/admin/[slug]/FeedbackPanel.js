'use client';
import { useState } from 'react';

export default function FeedbackPanel({ slug, initialRows }) {
  const [rows, setRows] = useState(initialRows);
  const [filter, setFilter] = useState('unresolved');

  async function toggle(id, resolved) {
    setRows(rs => rs.map(r => (r.id === id ? { ...r, resolved } : r)));
    await fetch('/api/admin/feedback/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved })
    });
  }

  const visible = rows.filter(r => {
    if (filter === 'unresolved') return !r.resolved;
    if (filter === 'resolved') return r.resolved;
    return true;
  });

  return (
    <>
      <div style={{ display: 'flex', gap: 8, margin: '14px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { k: 'unresolved', label: 'Nevyřešené' },
          { k: 'resolved', label: 'Vyřešené' },
          { k: 'all', label: 'Vše' }
        ].map(f => (
          <button
            key={f.k}
            type="button"
            onClick={() => setFilter(f.k)}
            style={{
              border: '1px solid var(--line)', borderRadius: 999, padding: '6px 14px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: filter === f.k ? 'var(--accent)' : 'transparent',
              color: filter === f.k ? '#fff' : 'var(--ink)'
            }}
          >{f.label}</button>
        ))}
        <a className="button" style={{ marginLeft: 'auto' }} href={'/api/admin/businesses/' + slug + '/export'}>
          Stáhnout CSV
        </a>
      </div>

      <table>
        <thead><tr><th>Datum</th><th>Hvězdy</th><th>Jméno</th><th>Zpráva</th><th></th></tr></thead>
        <tbody>
          {visible.length === 0 && (
            <tr><td colSpan="5" className="sub">Nic tu není.</td></tr>
          )}
          {visible.map(r => (
            <tr key={r.id}>
              <td>{new Date(r.created_at).toLocaleDateString('cs-CZ')}</td>
              <td><span className={'badge ' + (r.stars >= 4 ? 'good' : 'bad')}>{r.stars}★</span></td>
              <td>{r.customer_name || '—'}</td>
              <td>{r.message || '—'}</td>
              <td>
                <button
                  type="button"
                  onClick={() => toggle(r.id, !r.resolved)}
                  style={{
                    border: '1px solid var(--line)', borderRadius: 999, padding: '4px 10px',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                    background: r.resolved ? '#E1F5EE' : 'transparent',
                    color: r.resolved ? '#0F6E56' : 'var(--muted)'
                  }}
                >{r.resolved ? '✓ Vyřešeno' : 'Označit jako vyřešené'}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
