'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function ClientTable({ rows }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest');

  const filtered = useMemo(() => {
    let r = rows.filter(b => b.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === 'name') r = [...r].sort((a, b) => a.name.localeCompare(b.name, 'cs'));
    if (sort === 'week') r = [...r].sort((a, b) => b.weekCount - a.weekCount);
    return r;
  }, [rows, q, sort]);

  return (
    <>
      <div style={{ display: 'flex', gap: 8, margin: '14px 0', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Hledat podle jména…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 180, marginTop: 0 }}
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: '1px solid var(--line)', font: 'inherit' }}
        >
          <option value="newest">Nejnovější</option>
          <option value="name">Podle jména</option>
          <option value="week">Podle aktivity (7 dní)</option>
        </select>
      </div>

      <table>
        <thead><tr><th>Firma</th><th>Za 7 dní</th><th>Průměr</th><th></th></tr></thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan="4" className="sub">Nic nenalezeno.</td></tr>
          )}
          {filtered.map(b => (
            <tr key={b.id}>
              <td>{b.name}</td>
              <td>{b.weekCount}</td>
              <td>{b.weekAvg}</td>
              <td><Link href={'/admin/' + b.slug}>Detail</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
