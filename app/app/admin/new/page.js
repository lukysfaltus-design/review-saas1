'use client';
import { useRouter } from 'next/navigation';
import BusinessForm from '../BusinessForm';

export default function NewBusiness() {
  const router = useRouter();

  async function handleSubmit(form) {
    const res = await fetch('/api/admin/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Uložení selhalo.');
    }
    router.push('/admin');
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>Nový klient</h1>
        <p className="sub">Logo a sociální sítě jsou nepovinné — dá se to doplnit i později v editaci.</p>
        <BusinessForm onSubmit={handleSubmit} submitLabel="Vytvořit" />
      </div>
    </div>
  );
}
