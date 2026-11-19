import { useState } from 'react';
import { Lock, WifiOff, AlertTriangle } from 'lucide-react';
import { fmtClock } from '../lib/phase.js';

export const Notice = ({ children, err }) => <div className={`notice${err ? ' err' : ''}`} role={err ? 'alert' : 'note'}>{children}</div>;

export function ErrorState({ error, onRetry, text = 'Something went wrong' }) {
  const denied = error?.code === 'permission-denied';
  return (
    <div className="card stack" role="alert">
      <AlertTriangle color="#ff6b6b" />
      <h2>{denied ? 'Not available yet' : text}</h2>
      <p className="muted">{denied ? 'This information is not public right now.' : 'Check your connection and try again.'}</p>
      {onRetry && <button className="btn ghost" onClick={onRetry}>Retry</button>}
    </div>
  );
}

export const Empty = ({ icon: Icon = Lock, title, children }) => (
  <div className="card stack" style={{ textAlign: 'center', justifyItems: 'center', padding: 28 }}>
    <Icon size={44} color="#ffc928" /><h2>{title}</h2><p className="muted">{children}</p>
  </div>
);

export const Progress = ({ sold, target }) => (
  <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={target} aria-valuenow={sold} aria-label="Packets sold">
    <i style={{ width: `${Math.min(100, (sold / Math.max(1, target)) * 100)}%` }} />
  </div>
);

export const Countdown = ({ secs }) => <div className="countdown" aria-live="off" aria-label={`Reveal in ${fmtClock(secs)}`}>{fmtClock(secs)}</div>;

export function OfflineBar({ online }) {
  if (online) return null;
  return <div className="demo" role="status" style={{ background: '#ff6b6b' }}><WifiOff size={12} style={{ verticalAlign: -2 }} /> Offline — information may be out of date</div>;
}

// Confirmation dialog with optional required reason (for audited admin actions).
export function Confirm({ title, body, needReason, confirmLabel = 'Confirm', danger, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const ok = !needReason || reason.trim().length >= 3;
  return (
    <div className="modal-bg" role="dialog" aria-modal="true" aria-label={title} onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="muted">{body}</p>
        {needReason && (
          <label className="f">Reason (saved in audit log)
            <input value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
          </label>
        )}
        <div className="btns">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'danger' : 'primary'}`} disabled={!ok || busy}
            onClick={async () => { setBusy(true); try { await onConfirm(reason.trim()); } finally { setBusy(false); } }}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
