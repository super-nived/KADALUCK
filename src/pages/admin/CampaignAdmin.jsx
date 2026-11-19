import { useState, useEffect } from 'react';
import { useActiveCampaign, doc, setDoc, updateDoc, serverTimestamp, db, audit, useDoc } from '../../lib/data.jsx';
import { FormSkeleton } from '../../components/Loader.jsx';
import { Notice, Confirm } from '../../components/ui.jsx';

export async function createCampaign() {
  const dateISO = new Date().toISOString().slice(0, 10);
  const id = `c-${dateISO}-${Math.random().toString(36).slice(2, 6)}`;
  const data = {
    dateISO, targetPackets: 100, soldPackets: 0, status: 'selling', delayMinutes: 10,
    teaser: 'A local favourite is waiting to be discovered', soldOutAt: null, revealAt: null,
    claimOpensAt: null, claimClosesAt: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), version: 1,
  };
  await setDoc(doc(db, 'campaigns', id), data);
  await setDoc(doc(db, 'settings', 'public'), { activeCampaignId: id, legalApproved: false }, { merge: true });
  await audit('campaign.create', 'campaign', id, null, { dateISO });
  return id;
}

const STATUSES = ['selling', 'paused', 'claims_open', 'claimed', 'closed', 'cancelled'];
const toLocal = (ts) => { if (!ts?.toDate) return ''; const d = ts.toDate(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

export function CampaignAdmin() {
  const { campaign, cid, settings, loading } = useActiveCampaign();
  const [f, setF] = useState(null); const [msg, setMsg] = useState(''); const [dlg, setDlg] = useState(null);
  useEffect(() => { if (campaign) setF({ teaser: campaign.teaser || '', delayMinutes: campaign.delayMinutes ?? 10, targetPackets: campaign.targetPackets, status: campaign.status, claimOpensAt: toLocal(campaign.claimOpensAt), claimClosesAt: toLocal(campaign.claimClosesAt) }); }, [campaign]);
  if (loading || (campaign && !f)) return <FormSkeleton fields={6} />;
  if (!campaign) return <Notice>No campaign yet — create one from the Dashboard.</Notice>;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (reason = '') => {
    const next = {
      teaser: f.teaser.trim().slice(0, 140), delayMinutes: Math.max(0, Math.min(1440, Number(f.delayMinutes) || 0)),
      targetPackets: Math.max(1, Math.min(10000, Number(f.targetPackets) || 100)), status: f.status,
      claimOpensAt: f.claimOpensAt ? new Date(f.claimOpensAt) : null, claimClosesAt: f.claimClosesAt ? new Date(f.claimClosesAt) : null,
      updatedAt: serverTimestamp(),
    };
    if (next.targetPackets < campaign.soldPackets) { setMsg('Target cannot be below packets already sold.'); return; }
    await updateDoc(doc(db, 'campaigns', cid), next);
    await audit('campaign.update', 'campaign', cid, { status: campaign.status, target: campaign.targetPackets }, { status: next.status, target: next.targetPackets }, reason);
    setMsg('Saved.'); setDlg(null);
  };
  const statusChanged = f.status !== campaign.status;
  return (
    <div className="stack">
      <form className="card stack" onSubmit={(e) => { e.preventDefault(); statusChanged ? setDlg('reason') : save(); }}>
        <h2>Campaign settings</h2>
        <label className="f">Teaser (shown before reveal — no sponsor hints)<input maxLength={140} value={f.teaser} onChange={set('teaser')} /></label>
        <label className="f">Target packets<input type="number" min="1" max="10000" value={f.targetPackets} onChange={set('targetPackets')} /></label>
        <label className="f">Reveal delay after sellout (minutes)<input type="number" min="0" max="1440" value={f.delayMinutes} onChange={set('delayMinutes')} /></label>
        <label className="f">Status<select value={f.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="f">Claims open at<input type="datetime-local" value={f.claimOpensAt} onChange={set('claimOpensAt')} /></label>
        <label className="f">Claims close at<input type="datetime-local" value={f.claimClosesAt} onChange={set('claimClosesAt')} /></label>
        {msg && <Notice>{msg}</Notice>}
        <button className="btn primary">Save campaign</button>
      </form>
      <LegalFlag settings={settings} />
      <button className="btn ghost" onClick={() => setDlg('new')}>Start a new campaign day</button>
      {dlg === 'reason' && <Confirm title="Change status?" body={`Status ${campaign.status} → ${f.status}. This is audited.`} needReason onCancel={() => setDlg(null)} onConfirm={save} />}
      {dlg === 'new' && <Confirm title="Start new campaign?" body="Today's campaign stays in history; the public app switches to a fresh one at 0/100." confirmLabel="Create" onCancel={() => setDlg(null)} onConfirm={async () => { await createCampaign(); setDlg(null); }} />}
    </div>
  );
}

function LegalFlag({ settings }) {
  const [dlg, setDlg] = useState(false);
  const on = settings?.legalApproved === true;
  return (
    <div className="card stack">
      <div className="row"><h2>Prize claims</h2><span className={`pill${on ? '' : ' warn'}`}>{on ? 'ENABLED' : 'Disabled'}</span></div>
      <p className="muted">Keep disabled until legal review of the purchase-linked prize contest is complete (see PLAN.md §6).</p>
      <button className="btn ghost" onClick={() => setDlg(true)}>{on ? 'Disable claims' : 'Mark legal review approved'}</button>
      {dlg && <Confirm title={on ? 'Disable claims?' : 'Enable claims?'} body={on ? 'The app will show a preview-only notice again.' : 'Only enable after written legal approval.'} needReason danger={!on} onCancel={() => setDlg(false)}
        onConfirm={async (r) => { await setDoc(doc(db, 'settings', 'public'), { legalApproved: !on }, { merge: true }); await audit('settings.legalApproved', 'settings', 'public', { on }, { on: !on }, r); setDlg(false); }} />}
    </div>
  );
}
