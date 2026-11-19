// Pure campaign-phase logic (unit tested). `now` MUST be server-corrected time (ms).
export const PHASES = {
  NONE: 'none',
  SELLING: 'selling',
  COUNTDOWN: 'countdown',
  REVEALED: 'revealed',
  CLAIMS_OPEN: 'claims_open',
  CLAIMED: 'claimed',
  CLOSED: 'closed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
};

export function getPhase(campaign, now) {
  if (!campaign) return PHASES.NONE;
  const s = campaign.status;
  if (s === 'cancelled') return PHASES.CANCELLED;
  if (s === 'paused') return PHASES.PAUSED;
  if (s === 'claims_open') return PHASES.CLAIMS_OPEN;
  if (s === 'claimed') return PHASES.CLAIMED;
  if (s === 'closed') return PHASES.CLOSED;
  const reveal = campaign.revealAt?.toMillis ? campaign.revealAt.toMillis() : campaign.revealAt;
  if (reveal) return now >= reveal ? PHASES.REVEALED : PHASES.COUNTDOWN;
  return PHASES.SELLING;
}

export const isRevealedPhase = (p) =>
  [PHASES.REVEALED, PHASES.CLAIMS_OPEN, PHASES.CLAIMED, PHASES.CLOSED].includes(p);

export function secondsUntil(ts, now) {
  const ms = ts?.toMillis ? ts.toMillis() : ts;
  return ms ? Math.max(0, Math.ceil((ms - now) / 1000)) : null;
}

export const fmtClock = (secs) =>
  secs == null ? '--:--' : `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

// Only http(s) links are allowed from admin-entered data.
export function safeUrl(u) {
  try {
    const x = new URL(u);
    return x.protocol === 'https:' || x.protocol === 'http:' ? x.href : '';
  } catch {
    return '';
  }
}

export const clampCount = (n, target) => Math.max(0, Math.min(target, Math.trunc(Number(n) || 0)));
