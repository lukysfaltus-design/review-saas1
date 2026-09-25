'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BusinessForm from '../../BusinessForm';

export default function EditBusiness({ params }) {
  const { slug } = params;
  const router = useRouter();
  const [initial, setInitial] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch('/api/admin/businesses/' + slug)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(setInitial)
      .catch(() => setNotFound(true));
  }, [slug]);

  async function handleSubmit(form) {
    const res = await fetch('/api/admin/businesses/' + slug, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Uložení selhalo.');
    }
    router.push('/admin/' + slug);
  }

  if (notFound) return <div className="wrap"><div className="card">Tohoto klienta jsme nenašli.</div></div>;
  if (!initial) return <div className="wrap"><div className="card">Načítám…</div></div>;

  return (
    <div className="wrap">
      <div className="card">
        <h1>Upravit — {initial.name}</h1>
        <p className="sub">Slug se po vytvoření nedá měnit (byla by tím neplatná už rozdaná NFC karta / QR kód).</p>
        <BusinessForm initial={initial} onSubmit={handleSubmit} submitLabel="Uložit změny" editing />
      </div>
    </div>
  );
}
