import { describe, it, expect } from 'vitest';
import { getPhase, PHASES, clampCount, safeUrl, secondsUntil, fmtClock } from './phase.js';

describe('getPhase', () => {
  const base = { status: 'selling', revealAt: null };
  it('selling with no revealAt', () => expect(getPhase(base, 1000)).toBe(PHASES.SELLING));
  it('countdown before revealAt', () => expect(getPhase({ ...base, revealAt: 5000 }, 1000)).toBe(PHASES.COUNTDOWN));
  it('revealed at/after revealAt', () => expect(getPhase({ ...base, revealAt: 5000 }, 5000)).toBe(PHASES.REVEALED));
  it('paused/cancelled override', () => {
    expect(getPhase({ ...base, status: 'paused', revealAt: 1 }, 99)).toBe(PHASES.PAUSED);
    expect(getPhase({ ...base, status: 'cancelled' }, 99)).toBe(PHASES.CANCELLED);
  });
  it('no campaign', () => expect(getPhase(null, 1)).toBe(PHASES.NONE));
});
describe('helpers', () => {
  it('clampCount caps 0..target', () => {
    expect(clampCount(-5, 100)).toBe(0);
    expect(clampCount(250, 100)).toBe(100);
    expect(clampCount('abc', 100)).toBe(0);
    expect(clampCount(42.9, 100)).toBe(42);
  });
  it('safeUrl blocks javascript:', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('');
    expect(safeUrl('https://maps.google.com/x')).toContain('https://');
  });
  it('countdown formatting', () => {
    expect(secondsUntil(10000, 4000)).toBe(6);
    expect(secondsUntil(1000, 4000)).toBe(0);
    expect(fmtClock(600)).toBe('10:00');
  });
});
