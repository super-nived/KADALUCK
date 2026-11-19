import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useQuery, collection, query, limit, doc, setDoc, addDoc, updateDoc, serverTimestamp, db, audit } from '../../lib/data.jsx';
import { ListSkeleton } from '../../components/Loader.jsx';
import { Notice, Confirm, ErrorState } from '../../components/ui.jsx';
import { safeUrl } from '../../lib/phase.js';

const blank = () => ({ displayName: '', sponsorName: '', prize: '', claimedDate: new Date().toISOString().slice(0, 10), photoUrl: '', consentName: false, consentPhoto: false, published: false });

export function WinnersAdmin() {
  const { data, loading, error } = useQuery(() => query(collection(db, 'winners'), limit(200)), []);
  const [f, setF] = useState(null); const [err, setErr] = useState(''); const [del, setDel] = useState(null);
  if (loading) return <ListSkeleton rows={4} />;
  if (error) return <ErrorState error={error} />;
  const list = data.filter((w) => !w.deleted).sort((a, b) => (b.claimedDate || '').localeCompare(a.claimedDate || ''));

  const save = async (e) => {
    e.preventDefault(); setErr('');
    if (!f.displayName.trim() || !f.prize.trim()) return setErr('Name and prize are required.');
    if (f.published && !f.consentName) return setErr('Cannot publish without the winner\'s consent to show their name.');
    if (f.photoUrl && !safeUrl(f.photoUrl)) return setErr('Photo must be a valid https:// link.');
    const { id, ...rest } = f;
    const body = { ...rest, displayName: rest.displayName.trim(), sponsorName: rest.sponsorName.trim(), prize: rest.prize.trim(),
      photoUrl: rest.consentPhoto ? rest.photoUrl.trim() : '', deleted: false, updatedAt: serverTimestamp(), ...(rest.published ? { publishedAt: serverTimestamp() } : {}) };
    if (id) { await updateDoc(doc(db, 'winners', id), body); await audit('winner.update', 'winner', id, null, { published: body.published }); }
    else { const r = await addDoc(collection(db, 'winners'), { ...body, createdAt: serverTimestamp() }); await audit('winner.create', 'winner', r.id, null, { published: body.published }); }
    setF(null);
  };
  const remove = async (reason) => {
    await updateDoc(doc(db, 'winners', del.id), { deleted: true, published: false, updatedAt: serverTimestamp() });
    await audit('winner.delete', 'winner', del.id, { name: del.displayName }, null, reason); setDel(null);
  };
  const toggle = (k) => (e) => setF({ ...f, [k]: e.target.checked });
  const txt = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (f) return (
    <form className="card stack" onSubmit={save}>
      <h2>{f.id ? 'Edit winner' : 'Add winner'}</h2>
      <Notice>Only add real, verified winners. Nothing is shown publicly without consent.</Notice>
      <label className="f">Winner name<input value={f.displayName} onChange={txt('displayName')} /></label>
      <label className="f">Sponsor<input value={f.sponsorName} onChange={txt('sponsorName')} /></label>
      <label className="f">Prize<input value={f.prize} onChange={txt('prize')} /></label>
      <label className="f">Date<input type="date" value={f.claimedDate} onChange={txt('claimedDate')} /></label>
      <label className="f">Photo URL (https, only with consent)<input value={f.photoUrl} onChange={txt('photoUrl')} /></label>
      <label className="check"><input type="checkbox" checked={f.consentName} onChange={toggle('consentName')} /> Winner consented to show their name</label>
      <label className="check"><input type="checkbox" checked={f.consentPhoto} onChange={toggle('consentPhoto')} /> Winner consented to show their photo</label>
      <label className="check"><input type="checkbox" checked={f.published} onChange={toggle('published')} /> Publish to Winners page</label>
      {err && <Notice err>{err}</Notice>}
      <div className="btns"><button type="button" className="btn ghost" onClick={() => setF(null)}>Cancel</button><button className="btn primary">Save</button></div>
    </form>
  );
  return (
    <div className="stack">
      <button className="btn primary" onClick={() => setF(blank())}>Add winner</button>
      {list.length === 0 && <p className="muted">No winners yet.</p>}
      <div className="table">
        {list.map((w) => (
          <div className="item" key={w.id}><div><b>{w.displayName}</b><small>{w.claimedDate} · {w.published ? 'Published' : 'Draft'}</small></div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="chip" aria-label={`Edit ${w.displayName}`} onClick={() => setF({ ...blank(), ...w })}><Pencil size={16} /></button>
              <button className="chip" aria-label={`Delete ${w.displayName}`} onClick={() => setDel(w)}><Trash2 size={16} /></button></div></div>
        ))}
      </div>
      {del && <Confirm title="Delete winner?" body={`${del.displayName} will be removed from the public site (kept in the audit log).`} needReason danger confirmLabel="Delete" onCancel={() => setDel(null)} onConfirm={remove} />}
    </div>
  );
}
