import { Link } from 'react-router-dom';
import { ShoppingBag, ScanLine, Timer, Store, Gift, CalendarCheck, Footprints, BadgeCheck, ChevronDown } from 'lucide-react';
import { useT } from '../lib/i18n.jsx';
import HowStory from '../components/HowStory.jsx';

// Psychology: chunking (4 steps), one verb per step, concrete icons, reward-first framing,
// low-effort cues ("no sign-up"), progressive disclosure for rules/FAQ.
const STEPS = [
  { icon: ShoppingBag, tone: 'yellow', en: ['Buy', 'Get a ₹10 kadala cone from our vendor'], ml: ['വാങ്ങൂ', '₹10 കടല കോൺ വെൻഡറിൽ നിന്ന് വാങ്ങൂ'] },
  { icon: ScanLine, tone: 'pink', en: ['Scan', 'Scan the QR on the paper. No sign-up'], ml: ['സ്കാൻ', 'പേപ്പറിലെ QR സ്കാൻ ചെയ്യൂ. സൈൻ-അപ്പ് വേണ്ട'] },
  { icon: Timer, tone: 'mint', en: ['Wait', 'When all 100 sell out, a 10-min timer starts'], ml: ['കാത്തിരിക്കൂ', '100 എണ്ണവും വിറ്റാൽ 10 മിനിറ്റ് ടൈമർ'] },
  { icon: Store, tone: 'orange', en: ['Discover', 'The mystery shop and prize are revealed'], ml: ['കണ്ടെത്തൂ', 'രഹസ്യ കടയും സമ്മാനവും വെളിപ്പെടും'] },
];
const RULES = [
  { icon: CalendarCheck, en: "Today's paper only", ml: 'ഇന്നത്തെ പേപ്പർ മാത്രം' },
  { icon: Footprints, en: "Walk, don't rush", ml: 'ധൃതി വേണ്ട' },
  { icon: BadgeCheck, en: 'Staff check paper', ml: 'സ്റ്റാഫ് പരിശോധിക്കും' },
];
const FAQ = [
  ['Do I need to keep the paper?', 'Yes! Eat the nuts, but keep the paper cone. You show it at the shop to claim.', 'പേപ്പർ സൂക്ഷിക്കണോ?', 'വേണം! കടല കഴിക്കാം, പേപ്പർ കോൺ സൂക്ഷിക്കണം. കടയിൽ അത് കാണിക്കണം.'],
  ['Do I need an account?', 'No. Everyone scans the same QR. Nothing to register.', 'അക്കൗണ്ട് വേണോ?', 'വേണ്ട. എല്ലാവർക്കും ഒരേ QR. രജിസ്റ്റർ ചെയ്യേണ്ടതില്ല.'],
  ['Who wins?', 'The first eligible person whose paper the shop staff verify.', 'ആർക്കാണ് സമ്മാനം?', 'കടയിലെ സ്റ്റാഫ് പേപ്പർ പരിശോധിച്ച ആദ്യത്തെ യോഗ്യതയുള്ള ആൾക്ക്.'],
  ['Who pays the prize?', 'The sponsor shop. KADALUCK does not handle prize money.', 'സമ്മാനം ആര് നൽകും?', 'സ്പോൺസർ കട. KADALUCK പണം കൈകാര്യം ചെയ്യില്ല.'],
  ['Can I use yesterday\'s paper?', 'No. Only the genuine paper from today is valid.', 'ഇന്നലത്തെ പേപ്പർ?', 'പറ്റില്ല. ഇന്നത്തെ യഥാർത്ഥ പേപ്പർ മാത്രം.'],
  ['Can the QR prove my paper is real?', 'No. A shared QR can\'t. Staff check the paper by hand.', 'QR കൊണ്ട് തെളിയിക്കാമോ?', 'ഇല്ല. സ്റ്റാഫ് കൈകൊണ്ട് പേപ്പർ പരിശോധിക്കും.'],
];

export default function How() {
  const { lang } = useT();
  const ml = lang === 'ml';
  return (
    <div className="wrap how">
      <header className="stack" style={{ gap: 6 }}>
        <span className="eyebrow">{ml ? 'എങ്ങനെ പ്രവർത്തിക്കുന്നു' : 'How it works'}</span>
        <h1>{ml ? '8 എളുപ്പ ഘട്ടങ്ങൾ' : '8 easy steps'}</h1>
        <div className="flowstrip" aria-label="Flow">
          {(ml ? ['വാങ്ങൂ', 'സ്കാൻ', 'കാണൂ', 'കാത്തിരിക്കൂ', 'വെളിപ്പെടും', 'പോകൂ', 'നേടൂ!'] : ['Buy', 'Scan', 'Watch', 'Wait', 'Reveal', 'Visit', 'Win!']).map((w, k, arr) => (
            <span key={w}>{w}{k < arr.length - 1 && <i aria-hidden="true">→</i>}</span>))}
        </div>
      </header>

      <HowStory ml={ml} />

      <section className="card prize-card">
        <Gift size={30} color="#ffc928" aria-hidden="true" />
        <div>
          <h2>{ml ? 'കടല കഴിക്കൂ. പേപ്പർ സൂക്ഷിക്കൂ.' : 'Eat the nuts. Keep the paper.'}</h2>
          <p>{ml ? 'പേപ്പർ കോൺ ആണ് നിങ്ങളുടെ ടിക്കറ്റ്. സ്പോൺസർ കടയിൽ നിന്ന് സമ്മാനം — അധിക ചെലവില്ല.' : 'Your paper cone is the ticket to the sponsor shop prize. No extra cost.'}</p>
        </div>
      </section>

      <section aria-label="Quick rules" className="rules">
        {RULES.map(({ icon: Icon, en, ml: m }) => (<div className="rule" key={en}><Icon size={22} aria-hidden="true" /><span>{ml ? m : en}</span></div>))}
      </section>

      <section className="stack" aria-label="FAQ">
        <h2>{ml ? 'സംശയങ്ങൾ' : 'Quick questions'}</h2>
        {FAQ.map(([q, a, qm, am]) => (
          <details className="faq card" key={q}>
            <summary>{ml ? qm : q}<ChevronDown size={18} aria-hidden="true" /></summary>
            <p className="muted">{ml ? am : a}</p>
          </details>
        ))}
      </section>

      <div className="btns"><Link className="btn primary" to="/">{ml ? 'ഇന്നത്തെ ഡ്രോപ്പ്' : "See today's drop"}</Link><Link className="btn ghost" to="/vendor">{ml ? 'വെൻഡറെ കണ്ടെത്തൂ' : 'Find vendor'}</Link></div>
      <p className="muted" style={{ fontSize: 12.5 }}>{ml ? 'സമ്മാന ക്ലെയിം നിയമപരിശോധന കഴിയുംവരെ പ്രവർത്തനക്ഷമമല്ല.' : 'Prize claims stay off until the legal review is done.'}</p>
    </div>
  );
}
