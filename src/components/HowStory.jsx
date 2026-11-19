import { useEffect, useRef, useState } from 'react';
import { Sk } from './Loader.jsx';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const N = 8;
const TONES = ['yellow', 'pink', 'mint', 'orange', 'yellow', 'pink', 'mint', 'orange'];
// Mirrors the KADALUCK "How It Works" infographic: one clear verb per step.
const COPY = [
  { en: ['Find KADALUCK', 'Look for the KADALUCK kadala cart near you.', 'Look for the 3 coloured cones'], ml: ['KADALUCK കണ്ടെത്തൂ', 'നിങ്ങളുടെ അടുത്തുള്ള KADALUCK കടല കാർട്ട് നോക്കൂ.', '3 കളർ കോണുകൾ നോക്കൂ'] },
  { en: ['Buy a Kadala', 'Get a colourful kadala cone for just ₹10. Enjoy the nuts. The paper cone is your ticket!', 'Eat the nuts, keep the paper'], ml: ['കടല വാങ്ങൂ', 'വെറും ₹10-ന് കളർഫുൾ കടല കോൺ വാങ്ങൂ. കടല കഴിക്കാം. പേപ്പർ കോൺ ആണ് നിങ്ങളുടെ ടിക്കറ്റ്!', 'കടല കഴിക്കൂ, പേപ്പർ സൂക്ഷിക്കൂ'] },
  { en: ['Scan the QR', 'Scan the QR on your paper cone to open the KADALUCK website.', 'No sign-up. No login.'], ml: ['QR സ്കാൻ ചെയ്യൂ', 'പേപ്പർ കോണിലെ QR സ്കാൻ ചെയ്ത് KADALUCK വെബ്സൈറ്റ് തുറക്കൂ.', 'സൈൻ-അപ്പ് വേണ്ട'] },
  { en: ['Watch Live Sales', "See today's sales progress. Our team updates it as packets sell.", 'Updated by our team'], ml: ['വിൽപ്പന കാണൂ', 'ഇന്നത്തെ വിൽപ്പന പുരോഗതി കാണൂ. ഞങ്ങളുടെ ടീം അപ്ഡേറ്റ് ചെയ്യും.', 'ടീം അപ്ഡേറ്റ് ചെയ്യും'] },
  { en: ['Keep Your Paper', 'Finish the nuts, but do not throw the paper! Keep it safe while the mystery stays locked until all packets are sold.', "Don't throw the paper"], ml: ['പേപ്പർ സൂക്ഷിക്കൂ', 'കടല കഴിച്ചോളൂ, പക്ഷേ പേപ്പർ കളയരുത്! എല്ലാം വിറ്റുതീരുംവരെ രഹസ്യം പൂട്ടിയിരിക്കും.', 'പേപ്പർ കളയരുത്'] },
  { en: ['Reveal the Sponsor', "Once all packets are sold, we reveal today's sponsor, shop location and prize.", 'Revealed after a short timer'], ml: ['സ്പോൺസറെ അറിയൂ', 'എല്ലാം വിറ്റാൽ ഇന്നത്തെ സ്പോൺസർ, കട, സമ്മാനം വെളിപ്പെടും.', 'ചെറിയ ടൈമറിന് ശേഷം'] },
  { en: ['Go to the Shop', 'Take your KADALUCK paper cone to the revealed shop.', 'Travel safely, no rush'], ml: ['കടയിലേക്ക് പോകൂ', 'നിങ്ങളുടെ KADALUCK പേപ്പർ കോണുമായി കടയിൽ പോകൂ.', 'സുരക്ഷിതമായി പോകൂ'] },
  { en: ['Be the First to Claim', 'Show your original paper cone at the shop. The first eligible person, checked by staff, wins the prize.', "Staff check today's paper"], ml: ['ആദ്യം ക്ലെയിം ചെയ്യൂ', 'കടയിൽ ഒറിജിനൽ പേപ്പർ ആദ്യം കാണിക്കുന്ന യോഗ്യതയുള്ള ആൾക്ക് സമ്മാനം.', 'സ്റ്റാഫ് ഇന്നത്തെ പേപ്പർ പരിശോധിക്കും'] },
];

// 3D-cartoon clip per step. Coloured skeleton until playable; still poster if the clip fails.
function StepMedia({ n, reduce }) {
  const [state, setState] = useState('loading'); // loading | ready | failed
  const ref = useRef(null);
  useEffect(() => { if (ref.current && ref.current.readyState >= 3) setState('ready'); }, []);
  const poster = `/story/step${n}.jpg`;
  return (
    <div className="media">
      <div className="media-bg" style={{ backgroundImage: `url(${poster})` }} aria-hidden="true" />
      {state === 'loading' && <Sk className="media-sk" tone="pink" r={0} />}
      {state === 'failed' ? (
        <img className="on" src={poster} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : (
        <video ref={ref} className={state === 'ready' ? 'on' : ''} src={`/story/step${n}.mp4`} poster={poster}
          muted loop playsInline preload="auto" autoPlay={!reduce}
          onCanPlay={() => setState('ready')} onError={() => setState('failed')} aria-hidden="true" />
      )}
    </div>
  );
}

export default function HowStory({ ml }) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(!reduce);
  const touch = useRef(null);
  useEffect(() => { const v = document.createElement('video'); v.preload = 'auto'; v.src = `/story/step${((i + 1) % N) + 1}.mp4`; }, [i]);
  useEffect(() => {
    if (!play) return;
    const id = setTimeout(() => setI((n) => (n + 1) % N), 5500);
    return () => clearTimeout(id);
  }, [i, play]);
  const go = (n) => { setPlay(false); setI((n + N) % N); };
  const [h, p, tip] = ml ? COPY[i].ml : COPY[i].en;
  const [h2] = ml ? COPY[i].en : COPY[i].ml;
  return (
    <section className={`story tone-${TONES[i]}`} aria-roledescription="carousel" aria-label="How it works"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); }}>
      <div className="story-stage"><div key={i} className="scene-in"><StepMedia n={i + 1} reduce={reduce} /></div>
        <span className="story-num">{i + 1}<small>/{N}</small></span></div>
      <div className="story-bar" style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }} aria-hidden="true">
        {Array.from({ length: N }).map((_, n) => <i key={n} className={n < i ? 'done' : n === i ? 'cur' : ''} />)}
      </div>
      <div className="story-copy" aria-live="polite" key={`t${i}`}>
        <h2>{h} <small>{h2}</small></h2>
        <p>{p}</p>
        <span className="tipchip">{tip}</span>
      </div>
      <div className="story-ctl">
        <button className="chip" onClick={() => go(i - 1)} aria-label="Previous step"><ChevronLeft size={18} /></button>
        <button className="chip" onClick={() => setPlay((v) => !v)} aria-label={play ? 'Pause' : 'Play'}>{play ? <Pause size={16} /> : <Play size={16} />}</button>
        <div className="dots">{Array.from({ length: N }).map((_, n) => <button key={n} className={n === i ? 'on' : ''} onClick={() => go(n)} aria-label={`Step ${n + 1}`} />)}</div>
        <button className="chip" onClick={() => go(i + 1)} aria-label="Next step"><ChevronRight size={18} /></button>
      </div>
    </section>
  );
}
