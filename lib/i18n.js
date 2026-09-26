export const T = {
  cs: {
    review: {
      question: 'Jak byste ohodnotili vaši dnešní návštěvu?',
      sorry: 'Je nám líto, že to dnes nebylo stoprocentní. Napište nám prosím, co se stalo — majitel to uvidí přímo.',
      namePlaceholder: 'Vaše jméno (nepovinné)',
      messagePlaceholder: 'Co bychom měli zlepšit?',
      sending: 'Odesílám…',
      send: 'Odeslat zprávu',
      thanks: 'Díky za zpětnou vazbu, předáme ji dál majiteli.'
    },
    menu: {
      label: 'Menu',
      preparing: 'Menu se právě připravuje.',
      rateButton: '⭐ Ohodnotit návštěvu'
    },
    hub: {
      menuButton: '📋 Menu',
      rateButton: '⭐ Ohodnotit nás'
    },
    common: {
      notFound: 'Tuto stránku jsme nenašli.',
      loading: 'Načítám…',
      instagram: 'Instagram',
      facebook: 'Facebook',
      website: 'Web'
    }
  },
  en: {
    review: {
      question: 'How would you rate your visit today?',
      sorry: "We're sorry today wasn't perfect. Please tell us what happened — the owner will see it directly.",
      namePlaceholder: 'Your name (optional)',
      messagePlaceholder: 'What should we improve?',
      sending: 'Sending…',
      send: 'Send message',
      thanks: "Thanks for the feedback, we'll pass it on to the owner."
    },
    menu: {
      label: 'Menu',
      preparing: 'The menu is being prepared.',
      rateButton: '⭐ Rate your visit'
    },
    hub: {
      menuButton: '📋 Menu',
      rateButton: '⭐ Rate us'
    },
    common: {
      notFound: "We couldn't find this page.",
      loading: 'Loading…',
      instagram: 'Instagram',
      facebook: 'Facebook',
      website: 'Website'
    }
  }
};

export function detectLang() {
  const browserLang = typeof navigator !== 'undefined' ? navigator.language : '';
  if (browserLang && !browserLang.toLowerCase().startsWith('cs') && !browserLang.toLowerCase().startsWith('sk')) {
    return 'en';
  }
  return 'cs';
}
