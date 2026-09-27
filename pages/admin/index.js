import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/businesses');
    const data = await res.json();
    setBusinesses(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleDelete(id, name) {
    if (!confirm(`Opravdu smazat klienta „${name}“? Tuto akci nelze vrátit zpět.`)) return;
    await fetch(`/api/admin/businesses/${id}`, { method: 'DELETE' });
    load();
  }

  const filtered = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalClients = businesses.length;
  const activeClients = businesses.filter((b) => b.status === 'active').length;
  const totalWeek = businesses.reduce((s, b) => s + (b.last7 || 0), 0);
  const withAvg = businesses.filter((b) => b.avgRating);
  const avgAll = withAvg.length
    ? (withAvg.reduce((s, b) => s + parseFloat(b.avgRating), 0) / withAvg.length).toFixed(1)
    : '—';

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <h1>Klienti</h1>
        <div className="header-actions">
          <Link href="/admin/new" className="btn">
            + Nový klient
          </Link>
          <Link href="/admin/nfc" className="btn btn-secondary">
            Zapsat NFC kartu
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Celkem klientů" value={totalClients} />
        <StatCard label="Aktivní klienti" value={activeClients} />
        <StatCard label="Hodnocení za 7 dní" value={totalWeek} />
        <StatCard label="Průměrné hodnocení" value={avgAll} />
      </div>

      <input
        className="search-input"
        placeholder="Hledat firmu…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Načítání…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Firma</th>
              <th>Balíček</th>
              <th>Status</th>
              <th>Za 7 dní</th>
              <th>Průměr</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>
                  <span className="badge">{planLabel(b.plan)}</span>
                </td>
                <td>
                  <span className={`badge status-${b.status}`}>{statusLabel(b.status)}</span>
                </td>
                <td>{b.last7}</td>
                <td>{b.avgRating ? `${b.avgRating} ★` : '—'}</td>
                <td className="actions">
                  <Link href={`/admin/business/${b.id}`}>Detail</Link>
                  <button onClick={() => handleDelete(b.id, b.name)} className="link-danger">
                    Smazat
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  Žádní klienti nenalezeni.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function planLabel(p) {
  return { nfc: 'Jen NFC karta', monthly: 'Měsíční', weekly: 'Týdenní' }[p] || p;
}
function statusLabel(s) {
  return { trial: 'Trial', active: 'Aktivní', inactive: 'Neaktivní', cancelled: 'Ukončeno' }[s] || s;
}
