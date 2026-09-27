import { useState } from 'react';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

const TAGS = ['Dlouhé čekání', 'Nepříjemný personál', 'Špatná kvalita', 'Vysoká cena', 'Nečistota', 'Jiné'];

const T = {
  cs: {
    title: 'Jak byste ohodnotili vaši návštěvu?',
    submit: 'Odeslat',
    placeholder: 'Co bychom mohli udělat lépe? (nepovinné)',
    thanks: 'Děkujeme za zpětnou vazbu!',
    thanksSub: 'Vaše odpověď nám pomůže se zlepšit. V případě potřeby se vám ozveme osobně.',
    tagsLabel: 'Co se vám nelíbilo? (klidně vyberte víc možností)',
  },
  en: {
    title: 'How would you rate your visit?',
    submit: 'Submit',
    placeholder: 'What could we do better? (optional)',
    thanks: 'Thank you for your feedback!',
    thanksSub: 'Your response helps us improve. We may reach out personally if needed.',
    tagsLabel: 'What went wrong? (select all that apply)',
  },
};

export async function getServerSideProps({ params }) {
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!business) return { notFound: true };
  return { props: { business } };
}

export default function ReviewPage({ business }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [tags, setTags] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [lang, setLang] = useState('cs');
  const t = T[lang];

  function handleStarClick(n) {
    setRating(n);
    if (n === 5) {
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: business.slug, rating: n }),
      }).catch(() => {});
      window.location.href = business.google_review_link;
    } else {
      setShowForm(true);
    }
  }

  function toggleTag(tag) {
    setTags(tags.includes(tag) ? tags.filter((x) => x !== tag) : [...tags, tag]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: business.slug, rating, message, tags }),
    });
    setSubmitted(true);
  }

  const color = business.brand_color || '#2563eb';

  return (
    <div className="review-page" style={{ '--brand': color }}>
      <button className="lang-toggle" onClick={() => setLang(lang === 'cs' ? 'en' : 'cs')}>
        {lang === 'cs' ? 'EN' : 'CS'}
      </button>
      <div className="review-card">
        <h1>{business.name}</h1>

        {!submitted && !showForm && (
          <>
            <p className="review-title">{t.title}</p>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`star ${(hovered || rating) >= n ? 'filled' : ''}`}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => handleStarClick(n)}
                >
                  ★
                </span>
              ))}
            </div>
          </>
        )}

        {!submitted && showForm && (
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="stars small">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`star ${rating >= n ? 'filled' : ''}`}
                  onClick={() => setRating(n)}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="tags-label">{t.tagsLabel}</p>
            <div className="tag-chips">
              {TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={`chip ${tags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.placeholder}
              rows={4}
            />
            <button className="btn" type="submit">
              {t.submit}
            </button>
          </form>
        )}

        {submitted && (
          <div className="thanks">
            <div className="check">✓</div>
            <h2>{t.thanks}</h2>
            <p>{t.thanksSub}</p>
          </div>
        )}
      </div>
    </div>
  );
}
