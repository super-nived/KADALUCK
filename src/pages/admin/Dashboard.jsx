import { useState } from 'react';
import { Plus, Minus, Siren } from 'lucide-react';
import { useActiveCampaign, doc, updateDoc, serverTimestamp, Timestamp, db, audit } from '../../lib/data.jsx';
import { useClock } from '../../lib/clock.jsx';
import { getPhase, secondsUntil, clampCount } from '../../lib/phase.js';
import { CardSkeleton } from '../../components/Loader.jsx';
import { Progress, Countdown, Confirm, Notice, ErrorState } from '../../components/ui.jsx';
import { createCampaign } from './CampaignAdmin.jsx';
import { increment } from 'firebase/firestore';

export function Dashboard() {
  const { campaign, cid, loading, error } = useActiveCampaign();
  const { now } = useClock();
  const [dlg, setDlg] = useState(null);
  const [msg, setMsg] = useState('');
  if (loading) return <CardSkeleton lines={4} />;
  if (error) return <ErrorState error={error} />;
  if (!campaign) {
    return (
      <div className="card stack"><h2>No active campaign</h2><p className="muted">Create today's campaign to start selling.</p>
        <button className="btn primary" onClick={async () => { await createCampaign(); }}>Create today's campaign</button></div>
    );
  }
  const ref = doc(db, 'campaigns', cid);
  const phase = getPhase(campaign, now);
  const setCount = async (n, reason = '') => {
    const next = clampCount(n, campaign.targetPackets);
    await updateDoc(ref, { soldPackets: next, updatedAt: serverTimestamp(), version: increment(1) });
    await audit('sales.set', 'campaign', cid, { soldPackets: campaign.soldPackets }, { soldPackets: next }, reason);
  };
  const confirmSoldOut = async (reason) => {
    const revealMs = Math.round(now) + (campaign.delayMinutes ?? 10) * 60000;
    await updateDoc(ref, { soldOutAt: serverTimestamp(), revealAt: Timestamp.fromMillis(revealMs), updatedAt: serverTimestamp(), version: increment(1) });
    await audit('campaign.soldout_confirmed', 'campaign', cid, { revealAt: null }, { revealAt: revealMs }, reason);
    setDlg(null); setMsg('Sellout confirmed. Countdown started.');
  };
  const cancelCountdown = async (reason) => {
    await updateDoc(ref, { soldOutAt: null, revealAt: null, updatedAt: serverTimestamp(), version: increment(1) });
    await audit('campaign.countdown_cancelled', 'campaign', cid, { revealAt: campaign.revealAt?.toMillis?.() }, { revealAt: null }, reason);
    setDlg(null);
  };
  const full = campaign.soldPackets >= campaign.targetPackets;
  return (
    <div className="stack">
      {msg && <Notice>{msg}</Notice>}
      <div className="card stack">
        <div className="row"><span className="eyebrow">{campaign.dateISO}</span><span className="pill">{phase}</span></div>
        <div className="stat" style={{ fontSize: 48 }}>{campaign.soldPackets}<small> / {campaign.targetPackets}</small></div>
        <Progress sold={campaign.soldPackets} target={campaign.targetPackets} />
        <div className="btns">
          <button className="btn ghost" disabled={campaign.soldPackets <= 0 || !!campaign.revealAt} onClick={() => setCount(campaign.soldPackets - 1)}><Minus /> 1</button>
          <button className="btn primary" disabled={full || !!campaign.revealAt} onClick={() => setCount(campaign.soldPackets + 1)}><Plus /> 1</button>
        </div>
        <div className="btns">
          <button className="btn ghost" disabled={!!campaign.revealAt} onClick={() => setCount(campaign.soldPackets + 5)}>+5</button>
          <button className="btn ghost" disabled={!!campaign.revealAt} onClick={() => setDlg('set')}>Set exact…</button>
        </div>
      </div>
      {campaign.revealAt ? (
        <div className="card stack"><span className="eyebrow">Reveal countdown</span><Countdown secs={secondsUntil(campaign.revealAt, now)} />
          <button className="btn danger" onClick={() => setDlg('cancel')}>Cancel countdown (override)</button></div>
      ) : (
        <button className="btn primary" disabled={!full} onClick={() => setDlg('soldout')}><Siren /> Confirm sold out &amp; start countdown</button>
      )}
      {dlg === 'soldout' && <Confirm title="Confirm sellout?" body={`All ${campaign.targetPackets} packets sold. The sponsor is revealed in ${campaign.delayMinutes ?? 10} minutes. This cannot be undone without an audited override.`} confirmLabel="Start countdown" onCancel={() => setDlg(null)} onConfirm={confirmSoldOut} />}
      {dlg === 'cancel' && <Confirm title="Cancel countdown?" body="Reveal is cancelled. Explain why." needReason danger confirmLabel="Cancel countdown" onCancel={() => setDlg(null)} onConfirm={cancelCountdown} />}
      {dlg === 'set' && <SetExact max={campaign.targetPackets} onCancel={() => setDlg(null)} onSave={async (n, r) => { await setCount(n, r); setDlg(null); }} />}
    </div>
  );
}

function SetExact({ max, onCancel, onSave }) {
  const [n, setN] = useState(''); const [r, setR] = useState('');
  const ok = n !== '' && Number(n) >= 0 && Number(n) <= max && r.trim().length >= 3;
  return (
    <div className="modal-bg" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Set exact count</h2>
        <label className="f">Packets sold (0–{max})<input type="number" inputMode="numeric" min="0" max={max} value={n} onChange={(e) => setN(e.target.value)} autoFocus /></label>
        <label className="f">Reason<input value={r} onChange={(e) => setR(e.target.value)} /></label>
        <div className="btns"><button className="btn ghost" onClick={onCancel}>Cancel</button><button className="btn primary" disabled={!ok} onClick={() => onSave(Number(n), r.trim())}>Save</button></div>
      </div>
    </div>
  );
}
