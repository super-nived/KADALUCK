import { MapPin, ExternalLink } from 'lucide-react';
import { useVendor } from '../lib/data.jsx';
import { safeUrl } from '../lib/phase.js';
import { CardSkeleton, Sk } from '../components/Loader.jsx';
import { ErrorState, Empty } from '../components/ui.jsx';
import { useClock } from '../lib/clock.jsx';

export default function Vendor() {
  const { data, loading, error } = useVendor();
  const { now } = useClock();
  if (loading) return <div className="wrap"><Sk w="30%" h={12} tone="yellow" /><Sk w="60%" h={30} tone="pink" /><Sk h={150} r={22} tone="mint" /><CardSkeleton lines={2} /></div>;
  if (error) return <ErrorState error={error} onRetry={() => location.reload()} />;
  const updated = data?.lastUpdatedAt?.toMillis?.();
  const stale = updated && now - updated > 6 * 3600 * 1000;
  const map = safeUrl(data?.mapUrl || '');
  return (
    <div className="wrap">
      <span className="eyebrow">Find your crunch</span>
      <h1>Where's our <em>vendor?</em></h1>
      {!data || !data.active ? (
        <Empty icon={MapPin} title="Not selling right now">Our vendor's location is shown during selling hours only.</Empty>
      ) : (
        <div className="card stack">
          <div className="row"><h2>{data.publicLocationLabel}</h2><span className={`pill${stale ? ' warn' : ''}`}>{stale ? 'May be outdated' : 'Updated'}</span></div>
          {data.sellingHours && <p className="muted">Selling hours: {data.sellingHours}</p>}
          {updated && <p className="muted">Location set by our team at {new Date(updated).toLocaleString()}. Not live GPS.</p>}
          {map && <a className="btn primary" href={map} target="_blank" rel="noopener noreferrer"><ExternalLink size={18} /> Directions</a>}
        </div>
      )}
    </div>
  );
}
