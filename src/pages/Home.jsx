import { Link } from 'react-router-dom';
import { Lock, ChevronRight, Gift, Store } from 'lucide-react';
import { useActiveCampaign, useReveal } from '../lib/data.jsx';
import { useClock } from '../lib/clock.jsx';
import { useT } from '../lib/i18n.jsx';
import { getPhase, isRevealedPhase, secondsUntil, PHASES } from '../lib/phase.js';
import { HomeSkeleton, NutLoader } from '../components/Loader.jsx';
import { Progress, Countdown, ErrorState, Notice } from '../components/ui.jsx';

function Cones() {
  return (
    <div className="cones" aria-label="Three colourful KADALUCK paper cones">
      <img className="c-blue" src="/cones/cone-blue.svg" alt="" width="240" height="320" decoding="async" />
      <img className="c-yellow" src="/cones/cone-yellow.svg" alt="" width="240" height="320" decoding="async" />
      <img className="c-red" src="/cones/cone-red.svg" alt="" width="240" height="320" fetchPriority="high" />
    </div>
  );
}

function RevealedCard({ cid }) {
  const { data, loading, error } = useReveal(cid, true);
  if (loading) return <div className="card"><NutLoader compact label="Unwrapping the mystery…" /></div>;
  if (error || !data) return <div className="card"><NutLoader compact label="Revealing… one moment" /></div>;
  return (
    <div className="banner">
      <span className="eyebrow" style={{ color: '#5a1040' }}>Today's sponsor</span>
      {data.bannerUrl && <img src={data.bannerUrl} alt={`${data.sponsorName} banner`} />}
      <h2 style={{ fontSize: 24 }}>{data.sponsorName}</h2>
      <p><Gift size={16} style={{ verticalAlign: -3 }} /> {data.prizeTitle}</p>
      <Link className="btn primary" to="/mystery">View shop &amp; details <ChevronRight size={18} /></Link>
    </div>
  );
}

export default function Home() {
  const { t } = useT();
  const { now } = useClock();
  const { campaign, cid, settings, loading, error } = useActiveCampaign();

  if (loading) return <HomeSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => location.reload()} />;

  const phase = getPhase(campaign, now);
  const revealed = isRevealedPhase(phase);
  const sold = campaign?.soldPackets ?? 0, target = campaign?.targetPackets ?? 100;
  const secs = phase === PHASES.COUNTDOWN ? secondsUntil(campaign.revealAt, now) : null;

  return (
    <div className="wrap">
      <div className="hero-grid">
        <section className="hero">
          <span className="eyebrow">Kerala · local · fun</span>
          <h1>{t('headline')}</h1>
          <Cones />
        </section>
        <div className="stack">
          {!campaign ? (
            <Notice>{t('noCampaign')}</Notice>
          ) : revealed ? (
            <RevealedCard cid={cid} />
          ) : phase === PHASES.PAUSED || phase === PHASES.CANCELLED ? (
            <Notice>Today's drop is {phase}. Check back soon.</Notice>
          ) : (
            <section className="card mystery">
              <div className="row"><span className="eyebrow">Today's mystery</span><span className="lock"><Lock size={14} /> Locked</span></div>
              <h2>{campaign.teaser || t('mysteryHidden')}</h2>
              {phase === PHASES.COUNTDOWN ? (<><span className="muted">{t('revealIn')}</span><Countdown secs={secs} /></>) : <p className="muted">{t('mysteryHidden')}</p>}
            </section>
          )}
          {campaign && (
            <section className="card stack">
              <div className="row">
                <div className="stat">{sold}<small> / {target}</small></div>
                <span className={`pill${sold >= target ? '' : ' warn'}`}>{sold >= target ? 'Sold out' : t('sold')}</span>
              </div>
              <Progress sold={sold} target={target} />
              {phase === PHASES.SELLING && <p className="muted">{t('unlocks')}</p>}
            </section>
          )}
          <div className="btns">
            <Link className="btn primary" to="/vendor">{t('findVendor')}</Link>
            <Link className="btn ghost" to="/how-it-works">{t('seeHow')}</Link>
          </div>
          {settings && settings.legalApproved !== true && (
            <Notice><Store size={14} style={{ verticalAlign: -2 }} /> Prize claims are not active yet — this is a preview while rules and legal checks are completed.</Notice>
          )}
        </div>
      </div>
      <p className="muted" style={{ textAlign: 'center' }}>
        <Link to="/rules">Rules</Link> · <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · <Link to="/contact">Contact</Link>
      </p>
    </div>
  );
}
