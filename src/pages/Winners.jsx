import { Link, useParams } from 'react-router-dom';
import { Trophy, Store, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { usePublishedWinners, useDoc } from '../lib/data.jsx';
import { ListSkeleton, Sk, CardSkeleton } from '../components/Loader.jsx';
import { ErrorState, Empty } from '../components/ui.jsx';
import { safeUrl } from '../lib/phase.js';

// Public view only ever shows what consent allows.
const shape = (w) => ({
  ...w,
  name: w.consentName ? w.displayName : 'A KADALUCK customer',
  photo: w.consentPhoto ? safeUrl(w.photoUrl || '') : '',
});

export default function Winners() {
  const { data, loading, error } = usePublishedWinners();
  const [q, setQ] = useState('');
  if (loading) return <div className="wrap"><Sk w="30%" h={12} tone="yellow" /><Sk w="55%" h={30} tone="pink" /><ListSkeleton rows={5} /></div>;
  if (error) return <ErrorState error={error} onRetry={() => location.reload()} />;
  const list = data.filter((w) => !w.deleted).map(shape)
    .filter((w) => !q || `${w.name} ${w.sponsorName} ${w.prize}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.claimedDate || '').localeCompare(a.claimedDate || ''));
  return (
    <div className="wrap">
      <span className="eyebrow">Celebrate local</span>
      <h1>Our <em>winners</em></h1>
      {data.length > 0 && <input type="search" placeholder="Search winners or shops" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search winners" />}
      {list.length === 0 ? (
        <Empty icon={Trophy} title="First winner coming soon">Winners appear here only after they've agreed to be shown.</Empty>
      ) : (
        <div className="stack grid-2">
          {list.map((w) => (
            <Link key={w.id} to={`/winners/${w.id}`} className="card row" style={{ textDecoration: 'none', color: 'inherit', justifyContent: 'flex-start', gap: 12 }}>
              {w.photo ? <img src={w.photo} alt="" width="56" height="56" style={{ borderRadius: 16, objectFit: 'cover' }} loading="lazy" /> : <Trophy size={40} color="#ffc928" />}
              <div><span className="eyebrow">{w.claimedDate}</span><h2>{w.name}</h2><p className="muted">{w.prize} · {w.sponsorName}</p></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function WinnerDetail() {
  const { id } = useParams();
  const { data, loading, error } = useDoc('winners', id);
  if (loading) return <div className="wrap"><CardSkeleton lines={4} /></div>;
  if (error || !data || !data.published || data.deleted) return <div className="wrap"><Empty icon={Trophy} title="Winner not found">This winner isn't published.</Empty><Link className="btn ghost" to="/winners">Back</Link></div>;
  const w = shape(data);
  return (
    <div className="wrap">
      <Link to="/winners" className="btn ghost" style={{ width: 'fit-content' }}><ArrowLeft size={18} /> Winners</Link>
      <div className="card stack">
        {w.photo && <img src={w.photo} alt={w.name} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 18 }} />}
        <span className="eyebrow">{w.claimedDate}</span>
        <h1 style={{ fontSize: 28 }}>{w.name}</h1>
        <p>{w.prize}</p>
        <p className="muted"><Store size={14} style={{ verticalAlign: -2 }} /> Sponsored by {w.sponsorName}</p>
      </div>
    </div>
  );
}
