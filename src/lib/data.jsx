import { useEffect, useState } from 'react';
import {
  collection, doc, onSnapshot, orderBy, query, where, limit,
  setDoc, addDoc, serverTimestamp, Timestamp, updateDoc,
} from 'firebase/firestore';
import { db } from './firebase.js';

// Generic realtime doc hook: {data, loading, error}
export function useDoc(...path) {
  const [s, setS] = useState({ data: undefined, loading: true, error: null });
  const key = path.join('/');
  useEffect(() => {
    setS({ data: undefined, loading: true, error: null });
    if (!path.every(Boolean)) return;
    return onSnapshot(
      doc(db, ...path),
      (snap) => setS({ data: snap.exists() ? { id: snap.id, ...snap.data() } : null, loading: false, error: null }),
      (error) => setS({ data: undefined, loading: false, error }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return s;
}

export function useQuery(build, deps = []) {
  const [s, setS] = useState({ data: [], loading: true, error: null });
  useEffect(() => {
    setS((p) => ({ ...p, loading: true }));
    return onSnapshot(
      build(),
      (snap) => setS({ data: snap.docs.map((d) => ({ id: d.id, ...d.data() })), loading: false, error: null }),
      (error) => setS({ data: [], loading: false, error }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return s;
}

export const useSettings = () => useDoc('settings', 'public');
export const useVendor = () => useDoc('vendor', 'current');
export function useActiveCampaign() {
  const settings = useSettings();
  const cid = settings.data?.activeCampaignId;
  const campaign = useDoc('campaigns', cid);
  return {
    settings: settings.data,
    campaign: campaign.data,
    cid,
    loading: settings.loading || (cid && campaign.loading),
    error: settings.error || campaign.error,
  };
}
export const useReveal = (cid, enabled) => useDoc('campaigns', enabled ? cid : null, 'reveal', 'details');
export const usePublishedWinners = () =>
  useQuery(() => query(collection(db, 'winners'), where('published', '==', true), limit(100)), []);

// ---- Admin writes (every one records an audit event) ----
export async function audit(action, entityType, entityId, before, after, reason = '') {
  const { auth } = await import('./fbauth.js');
  const u = auth.currentUser;
  await addDoc(collection(db, 'audit'), {
    actorId: u.uid, actorEmail: u.email, action, entityType, entityId,
    before: before ?? null, after: after ?? null, reason, timestamp: serverTimestamp(),
  });
}
export { doc, collection, setDoc, addDoc, updateDoc, serverTimestamp, Timestamp, db, query, orderBy, limit, onSnapshot };
