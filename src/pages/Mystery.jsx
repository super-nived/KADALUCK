import { useState, useEffect } from 'react';
import { Lock, ExternalLink, Phone, Gift, Clock } from 'lucide-react';
import { useActiveCampaign, useReveal } from '../lib/data.jsx';
import { useClock } from '../lib/clock.jsx';
import { getPhase, isRevealedPhase, secondsUntil, safeUrl, PHASES } from '../lib/phase.js';
import { CardSkeleton, Sk, NutLoader } from '../components/Loader.jsx';
import { Empty, Countdown, Progress, Notice } from '../components/ui.jsx';

const fmt = (ts) => (ts?.toDate ? ts.toDate().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—');

function Reveal({ cid, campaign, legal, onRetry }) {
  const { data, loading, error } = useReveal(cid, true);
  useEffect(() => {
    if (!error) return;
    const id = setTimeout(onRetry, 3000); // server clock may be a few seconds behind ours
    return () => clearTimeout(id);
  }, [error, onRetry]);
  if (loading || error || !data) return <div className="card"><NutLoader label="Unwrapping the mystery…" /></div>;
  const map = safeUrl(data.mapUrl || '');
  return (
    <div className="wrap">
      <div className="banner">
        <span className="eyebrow" style={{ color: '#5a1040' }}>Revealed</span>
        {data.bannerUrl && <img src={data.bannerUrl} alt={`${data.sponsorName} banner`} />}
        <div className="row" style={{ justifyContent: 'flex-start', gap: 12 }}>
          {data.logoUrl && <img src={data.logoUrl} alt={`${data.sponsorName} logo`} style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover' }} />}
          <div><h1 style={{ fontSize: 26, color: '#2a0b1c' }}>{data.sponsorName}</h1><p>{data.category}</p></div>
        </div>
      </div>
      <div className="card stack">
        <div className="row" style={{ justifyContent: 'flex-start', gap: 10 }}><Gift color="#ffc928" /><div><span className="eyebrow">Prize</span><h2>{data.prizeTitle}</h2></div></div>
        {data.prizeDescription && <p className="muted">{data.prizeDescription}</p>}
        {data.description && <p>{data.description}</p>}
        {data.address && <p className="muted">{data.address}</p>}
        {data.hours && <p className="muted"><Clock size={14} style={{ verticalAlign: -2 }} /> {data.hours}</p>}
        <div className="btns">
          {map && <a className="btn primary" href={map} target="_blank" rel="noopener noreferrer"><ExternalLink size={18} /> Directions</a>}
          {data.phone && <a className="btn ghost" href={`tel:${data.phone.replace(/[^+\d]/g, '')}`}><Phone size={18} /> Call</a>}
        </div>
      </div>
      <div className="card stack">
        <h2>Claim window</h2>
        <p className="muted">Opens: {fmt(campaign.claimOpensAt)} · Closes: {fmt(campaign.claimClosesAt)}</p>
        <p className="muted">Bring today's genuine paper. Shop staff verify it by hand; the first eligible verified claimant wins. Travel safely — speed is not rewarded.</p>
        {!legal && <Notice>Prize claims are not active yet — preview only.</Notice>}
      </div>
    </div>
  );
}

export default function Mystery() {
  const { campaign, cid, settings, loading } = useActiveCampaign();
  const { now } = useClock();
  const [attempt, setAttempt] = useState(0);
  if (loading) return <div className="wrap"><Sk w="30%" h={12} tone="yellow" /><Sk h={170} r={22} tone="pink" /><CardSkeleton /></div>;
  const phase = getPhase(campaign, now);
  if (isRevealedPhase(phase)) return <Reveal key={attempt} cid={cid} campaign={campaign} legal={settings?.legalApproved === true} onRetry={() => setAttempt((a) => a + 1)} />;
  return (
    <div className="wrap">
      <span className="eyebrow">The mystery</span>
      <h1>Shh… still a <em>secret</em></h1>
      <Empty icon={Lock} title={campaign?.teaser || 'A local favourite is waiting'}>The shop name, location and prize are revealed together after sellout and the countdown.</Empty>
      {campaign && <div className="card stack"><div className="stat">{campaign.soldPackets}<small> / {campaign.targetPackets}</small></div><Progress sold={campaign.soldPackets} target={campaign.targetPackets} />
        {phase === PHASES.COUNTDOWN && <><span className="muted">Reveal in</span><Countdown secs={secondsUntil(campaign.revealAt, now)} /></>}</div>}
    </div>
  );
}
