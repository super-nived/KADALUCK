import { useState, useEffect } from 'react';
import { useActiveCampaign, useReveal, doc, setDoc, serverTimestamp, db, audit } from '../../lib/data.jsx';
import { FormSkeleton } from '../../components/Loader.jsx';
import { Notice } from '../../components/ui.jsx';
import { safeUrl } from '../../lib/phase.js';

const EMPTY = { sponsorName: '', category: '', description: '', address: '', mapUrl: '', phone: '', hours: '', prizeTitle: '', prizeDescription: '', logoUrl: '', bannerUrl: '' };
const URLS = ['mapUrl', 'logoUrl', 'bannerUrl'];

export function SponsorAdmin() {
  const { cid, loading } = useActiveCampaign();
  const rev = useReveal(cid, true);
  const [f, setF] = useState(null); const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  useEffect(() => { if (!rev.loading) setF({ ...EMPTY, ...(rev.data || {}) }); }, [rev.loading, rev.data]);
  if (loading || rev.loading || !f) return <FormSkeleton fields={8} />;
  if (!cid) return <Notice>Create a campaign first.</Notice>;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    for (const k of URLS) if (f[k] && !safeUrl(f[k])) return setErr(`${k} must be a valid https:// link.`);
    if (!f.sponsorName.trim() || !f.prizeTitle.trim()) return setErr('Sponsor name and prize are required.');
    const clean = Object.fromEntries(Object.entries(f).filter(([k]) => k in EMPTY).map(([k, v]) => [k, String(v).trim().slice(0, 600)]));
    await setDoc(doc(db, 'campaigns', cid, 'reveal', 'details'), { ...clean, updatedAt: serverTimestamp() });
    await audit('sponsor.save', 'reveal', cid, null, { sponsorName: clean.sponsorName, prizeTitle: clean.prizeTitle });
    setMsg('Saved. Hidden from the public until reveal time.');
  };
  const fields = [['sponsorName', 'Sponsor / shop name'], ['category', 'Category'], ['prizeTitle', 'Prize'], ['prizeDescription', 'Prize details', 1], ['description', 'Shop description', 1], ['address', 'Shop address'], ['hours', 'Opening hours'], ['phone', 'Phone'], ['mapUrl', 'Google Maps link (https)'], ['logoUrl', 'Logo image URL (https)'], ['bannerUrl', 'Banner image URL (https)']];
  return (
    <form className="card stack" onSubmit={save}>
      <h2>Mystery sponsor</h2>
      <Notice>Hidden from the public (enforced by database rules) until the reveal time. Don't print the logo on the outside of packets.</Notice>
      {fields.map(([k, label, area]) => (
        <label className="f" key={k}>{label}{area ? <textarea value={f[k]} onChange={set(k)} /> : <input value={f[k]} onChange={set(k)} inputMode={k === 'phone' ? 'tel' : undefined} />}</label>
      ))}
      {f.logoUrl && safeUrl(f.logoUrl) && <img src={safeUrl(f.logoUrl)} alt="Logo preview" style={{ height: 60, objectFit: 'contain', alignSelf: 'start' }} />}
      {err && <Notice err>{err}</Notice>}{msg && <Notice>{msg}</Notice>}
      <button className="btn primary">Save sponsor</button>
    </form>
  );
}
