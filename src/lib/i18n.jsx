import { createContext, useContext, useState, useCallback } from 'react';

const STR = {
  en: {
    home: 'Home', vendor: 'Vendor', winners: 'Winners', how: 'How it works',
    headline: 'Buy Kadala. Discover the Mystery Shop.',
    sub: '₹10 packet · one shared QR · no sign-up',
    mysteryHidden: 'Sponsor, shop & prize are a secret until reveal',
    sold: 'Packets sold', findVendor: 'Find our vendor', seeHow: 'See how it works',
    revealIn: 'Reveal in', unlocks: 'Unlocks when all packets are sold',
    revealed: 'Revealed!', demo: 'Demo data',
    loading: 'Loading…', retry: 'Retry', offline: "You're offline",
    noCampaign: 'No campaign is live right now. Please check back soon.',
  },
  ml: {
    home: 'ഹോം', vendor: 'വെൻഡർ', winners: 'വിജയികൾ', how: 'എങ്ങനെ',
    headline: 'കടല വാങ്ങൂ. രഹസ്യ കട കണ്ടെത്തൂ.',
    sub: '₹10 പാക്കറ്റ് · ഒരേ QR · സൈൻ-അപ്പ് വേണ്ട',
    mysteryHidden: 'സ്പോൺസർ, കട, സമ്മാനം — വെളിപ്പെടുത്തുംവരെ രഹസ്യം',
    sold: 'വിറ്റ പാക്കറ്റുകൾ', findVendor: 'വെൻഡറെ കണ്ടെത്തൂ', seeHow: 'എങ്ങനെയെന്ന് കാണൂ',
    revealIn: 'വെളിപ്പെടുത്താൻ', unlocks: 'എല്ലാ പാക്കറ്റും വിറ്റാൽ തുറക്കും',
    revealed: 'വെളിപ്പെടുത്തി!', demo: 'ഡെമോ ഡാറ്റ',
    loading: 'ലോഡ് ചെയ്യുന്നു…', retry: 'വീണ്ടും ശ്രമിക്കുക', offline: 'ഓഫ്‌ലൈൻ ആണ്',
    noCampaign: 'ഇപ്പോൾ ക്യാമ്പെയ്ൻ ഇല്ല. പിന്നീട് നോക്കൂ.',
  },
};

const Ctx = createContext(null);
export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('kl-lang') || 'en'; } catch { return 'en'; }
  });
  const change = useCallback((l) => {
    setLang(l);
    try { localStorage.setItem('kl-lang', l); } catch { /* ignore */ }
    document.documentElement.lang = l;
  }, []);
  const t = (k) => STR[lang][k] ?? STR.en[k] ?? k;
  return <Ctx.Provider value={{ lang, setLang: change, t }}>{children}</Ctx.Provider>;
}
export const useT = () => useContext(Ctx);
