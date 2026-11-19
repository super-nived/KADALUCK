import { useState, useEffect } from 'react';
import { useVendor, doc, setDoc, serverTimestamp, db, audit } from '../../lib/data.jsx';
import { FormSkeleton } from '../../components/Loader.jsx';
import { Notice } from '../../components/ui.jsx';
import { safeUrl } from '../../lib/phase.js';

export function VendorAdmin() {
  const { data, loading } = useVendor();
  const [f, setF] = useState(null); const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  useEffect(() => { if (!loading) setF({ publicLocationLabel: '', mapUrl: '', sellingHours: '', active: false, ...(data || {}) }); }, [loading, data]);
  if (loading || !f) return <FormSkeleton fields={4} />;
  const save = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    if (f.mapUrl && !safeUrl(f.mapUrl)) return setErr('Map link must be a valid https:// link.');
    await setDoc(doc(db, 'vendor', 'current'), { publicLocationLabel: f.publicLocationLabel.trim().slice(0, 140), mapUrl: f.mapUrl.trim(), sellingHours: f.sellingHours.trim().slice(0, 80), active: !!f.active, lastUpdatedAt: serverTimestamp() });
    await audit('vendor.update', 'vendor', 'current', null, { active: !!f.active, label: f.publicLocationLabel });
    setMsg('Saved.');
  };
  return (
    <form className="card stack" onSubmit={save}>
      <h2>Vendor location</h2>
      <p className="muted">Entered by hand — shown as "last updated", never as live GPS. Turn off when off-shift to keep your location private.</p>
      <label className="check"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Show location publicly (selling now)</label>
      <label className="f">Location label<input value={f.publicLocationLabel} onChange={(e) => setF({ ...f, publicLocationLabel: e.target.value })} /></label>
      <label className="f">Map link (https)<input value={f.mapUrl} onChange={(e) => setF({ ...f, mapUrl: e.target.value })} /></label>
      <label className="f">Selling hours<input value={f.sellingHours} onChange={(e) => setF({ ...f, sellingHours: e.target.value })} placeholder="4:00 PM – 8:00 PM" /></label>
      {err && <Notice err>{err}</Notice>}{msg && <Notice>{msg}</Notice>}
      <button className="btn primary">Save &amp; stamp time</button>
    </form>
  );
}
