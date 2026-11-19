import { useQuery, collection, query, orderBy, limit, db } from '../../lib/data.jsx';
import { ListSkeleton } from '../../components/Loader.jsx';
import { ErrorState } from '../../components/ui.jsx';

export function AuditLog() {
  const { data, loading, error } = useQuery(() => query(collection(db, 'audit'), orderBy('timestamp', 'desc'), limit(60)), []);
  if (loading) return <ListSkeleton rows={6} />;
  if (error) return <ErrorState error={error} />;
  if (!data.length) return <p className="muted">No actions recorded yet.</p>;
  return (
    <div className="table">
      {data.map((a) => (
        <div className="item" key={a.id}><div><b>{a.action}</b><small>{a.actorEmail} · {a.reason || '—'}</small></div><small>{a.timestamp?.toDate?.().toLocaleString() ?? '…'}</small></div>
      ))}
    </div>
  );
}
