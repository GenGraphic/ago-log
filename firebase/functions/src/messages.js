// Texts sent by the backend (push, email, in-app), in the app's languages.
// user.language is synced from the app; anything else falls back to English.

const TYPE_LABELS = {
  ro: {
    Passport: 'pașaport', Driving_License: 'permis de conducere', ID_Card: 'carte de identitate', Visa: 'viză',
    Car_Insurance: 'asigurare auto', Health_Insurance: 'asigurare de sănătate', Home_Insurance: 'asigurare locuință',
    Travel_Insurance: 'asigurare de călătorie', Car_Inspection: 'ITP', Car_Maintenance: 'revizie auto',
    Vehicle_Registration: 'înmatriculare', Vignette: 'rovinietă', Vaccination: 'vaccin', Prescription: 'rețetă',
    Medical_Checkup: 'control medical', Subscription: 'abonament', Contract: 'contract', Warranty: 'garanție',
    Property_Lease: 'contract de închiriere', Birthday: 'zi de naștere', Anniversary: 'aniversare',
    Credential: 'cont', Reminder: 'reminder',
  },
};

const STRINGS = {
  en: {
    expiresToday: (t) => `${t} expires today`,
    expiresIn: (t, d) => `${t} expires in ${d} day${d === 1 ? '' : 's'}`,
    expired: (t) => `${t} has expired`,
    dueSoonBody: (type, d) =>
      d === 0
        ? `Your ${type} expires today. Renew it now so it doesn't lapse.`
        : `Your ${type} is due soon. We'll remind you every day until then.`,
    expiredBody: (type, d) => `Your ${type} expired ${d} day${d === 1 ? '' : 's'} ago. Take action now.`,
    warrantyEndsIn: (t, d) =>
      d === 0 ? `The warranty for ${t} ends today` : `The warranty for ${t} ends in ${d} day${d === 1 ? '' : 's'}`,
    warrantyBody: (t) => `Check that ${t} still works properly. Until then, defects are repaired for free.`,
    summaryTitle: (n) => `${n} items need your attention`,
    summaryBody: (titles) => `${titles.slice(0, 3).join(', ')}${titles.length > 3 ? '…' : ''}`,
    remindersEmailHeading: 'Upcoming expirations',
    openApp: 'Open the app to see the details.',
    emptyTitle: 'Your documents, all in one place',
    emptyBody: 'Add your ID, car insurance or a subscription and we will remind you before anything expires.',
    sources: 'Sources',
    testTitle: 'Test notification',
    testBody: 'Push notifications are working.',
    testEmailBody: 'Email notifications are working.',
  },
  ro: {
    expiresToday: (t) => `${t} expiră azi`,
    expiresIn: (t, d) => (d === 1 ? `${t} expiră mâine` : `${t} expiră în ${d} zile`),
    expired: (t) => `${t} a expirat`,
    dueSoonBody: (type, d) =>
      d === 0
        ? `Termenul pentru ${type} este azi. Reînnoiește acum ca să nu rămâi descoperit.`
        : `Termenul pentru ${type} se apropie. Îți amintim zilnic până atunci.`,
    expiredBody: (type, d) =>
      `Termenul pentru ${type} a trecut ${d === 1 ? 'ieri' : `acum ${d} zile`}. Ia măsuri acum.`,
    warrantyEndsIn: (t, d) =>
      d === 0
        ? `Garanția pentru ${t} expiră azi`
        : d === 1
          ? `Garanția pentru ${t} expiră mâine`
          : `Garanția pentru ${t} expiră în ${d} zile`,
    warrantyBody: (t) => `Verifică dacă ${t} funcționează corect. Până atunci, defectele se repară gratuit.`,
    summaryTitle: (n) => `${n} lucruri au nevoie de atenția ta`,
    summaryBody: (titles) => `${titles.slice(0, 3).join(', ')}${titles.length > 3 ? '…' : ''}`,
    remindersEmailHeading: 'Expirări apropiate',
    openApp: 'Deschide aplicația pentru detalii.',
    emptyTitle: 'Documentele tale, într-un singur loc',
    emptyBody: 'Adaugă buletinul, asigurarea auto sau un abonament și îți amintim înainte să expire ceva.',
    sources: 'Surse',
    testTitle: 'Notificare de test',
    testBody: 'Notificările push funcționează.',
    testEmailBody: 'Notificările pe email funcționează.',
  },
};

export function langOf(user) {
  return STRINGS[user?.language] ? user.language : 'en';
}

export function t(lang) {
  return STRINGS[lang] ?? STRINGS.en;
}

export function typeLabel(lang, entryType) {
  return TYPE_LABELS[lang]?.[entryType] ?? String(entryType ?? 'entry').replace(/_/g, ' ').toLowerCase();
}

/** Expiry reminder for one entry, `days` until expiry (negative = expired). */
export function expiryMessage(lang, entry, days) {
  const s = t(lang);
  // Warranties: a nudge to check the product while repairs are still free.
  if (entry.entryType === 'Warranty') {
    return { title: s.warrantyEndsIn(entry.title, days), body: s.warrantyBody(entry.title), type: 'warning' };
  }
  const type = typeLabel(lang, entry.entryType);
  if (days < 0) {
    return { title: s.expired(entry.title), body: s.expiredBody(type, -days), type: 'expired' };
  }
  return {
    title: days === 0 ? s.expiresToday(entry.title) : s.expiresIn(entry.title, days),
    body: s.dueSoonBody(type, days),
    type: 'warning',
  };
}
