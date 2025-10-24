import { FilterModel } from '../types';

export function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function daysBetween(startMs: number, endMs: number) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((endMs - startMs) / msPerDay);
}

export function computeFilterProgress(f: FilterModel, now: number = Date.now()) {
  const usedDays = Math.max(0, daysBetween(f.startedAt, now));
  const remaining = Math.max(0, f.lifespanDays - usedDays);
  const progress = clamp01(remaining / Math.max(1, f.lifespanDays));
  return { usedDays, remaining, progress };
}

export function nextLetter(lettersInUse: string[]): string {
  const A = 'A'.charCodeAt(0);
  const Z = 'Z'.charCodeAt(0);
  for (let code = A; code <= Z; code++) {
    const letter = String.fromCharCode(code);
    if (!lettersInUse.includes(letter)) return letter;
  }
  throw new Error('已用尽 A-Z 标识');
}
