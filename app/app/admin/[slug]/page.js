import { supabaseAdmin } from '@/lib/supabaseAdmin';
import FeedbackPanel from './FeedbackPanel';

export const dynamic = 'force-dynamic';

export default async function BusinessDetail({ params }) {
  const db = supabaseAdmin();
  const { data: biz } = await db.from('businesses').select('*').eq('slug', params.slug).single();

  if (!biz) {
    return <div className="wrap"><div className="card">Tohoto klienta jsme nenašli.</div></div>;
  }

  const { data: fb } = await db
    .from('feedback')
    .select('*')
    .eq('business_id', biz.id)
    .order('created_at', { ascending: false })
    .limit(500);

  return (
    <div className="wrap">
      <div className="card">
        <h1>{biz.name}</h1>
        <p className="sub">
          Recenzní odkaz pro tuto firmu: <code>/r/{biz.slug}</code><br />
          Zprávy chodí na: {biz.owner_email}<br />
          <a href={'/admin/' + biz.slug + '/edit'}>Upravit logo, sociální sítě a barvu →</a>
        </p>
        <FeedbackPanel slug={biz.slug} initialRows={fb || []} />
      </div>
    </div>
  );
}
