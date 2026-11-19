import { createContext, useContext, useEffect, useState } from 'react';

// Server-corrected clock: offset estimated from the HTTP Date header of our own
// host. UI only — real reveal gating is enforced by Firestore rules (request.time).
const ClockCtx = createContext({ now: Date.now(), synced: false });

export function ClockProvider({ children }) {
  const [offset, setOffset] = useState(0);
  const [synced, setSynced] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let alive = true;
    const sync = async () => {
      try {
        const t0 = Date.now();
        const res = await fetch('/', { method: 'HEAD', cache: 'no-store' });
        const t1 = Date.now();
        const date = res.headers.get('date');
        if (date && alive) {
          setOffset(new Date(date).getTime() + (t1 - t0) / 2 - t1);
          setSynced(true);
        }
      } catch { /* offline: fall back to device clock, flagged as unsynced */ }
    };
    sync();
    const id = setInterval(sync, 5 * 60 * 1000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return <ClockCtx.Provider value={{ now: now + offset, synced }}>{children}</ClockCtx.Provider>;
}
export const useClock = () => useContext(ClockCtx);
