import type { PreferenceStatus, ProgramLevel } from "@/lib/enums";
import { PREFERENCE_TIMEOUT_DAYS } from "./constants";

export type PreferenceLike = {
  id: string;
  rank: number;
  status: PreferenceStatus;
  offeredAt: Date | string | null;
};

export function remainingQuota(input: {
  quotaLisans: number;
  quotaYL: number;
  assignedLisans: number;
  assignedYL: number;
  level: ProgramLevel | string;
}) {
  if (input.level === "LISANS") {
    return Math.max(0, input.quotaLisans - input.assignedLisans);
  }
  return Math.max(0, input.quotaYL - input.assignedYL);
}

export function hasAvailableQuota(input: {
  quotaLisans: number;
  quotaYL: number;
  assignedLisans: number;
  assignedYL: number;
  level: ProgramLevel;
}) {
  return remainingQuota(input) > 0;
}

export function getActivePreference<T extends PreferenceLike>(preferences: T[]): T | undefined {
  return preferences
    .filter((p) => p.status === "BEKLIYOR" && p.offeredAt)
    .sort((a, b) => a.rank - b.rank)[0];
}

export function getNextQueuedPreference<T extends PreferenceLike>(
  preferences: T[],
  afterRank: number
): T | undefined {
  return preferences
    .filter((p) => p.status === "BEKLIYOR" && !p.offeredAt && p.rank > afterRank)
    .sort((a, b) => a.rank - b.rank)[0];
}

export function isPreferenceExpired(offeredAt: Date | string | null, now = new Date()) {
  if (!offeredAt) return false;
  const start = offeredAt instanceof Date ? offeredAt : new Date(offeredAt);
  const deadline = new Date(start);
  deadline.setDate(deadline.getDate() + PREFERENCE_TIMEOUT_DAYS);
  return now.getTime() >= deadline.getTime();
}

export function preferenceDeadline(offeredAt: Date | string) {
  const start = offeredAt instanceof Date ? offeredAt : new Date(offeredAt);
  const deadline = new Date(start);
  deadline.setDate(deadline.getDate() + PREFERENCE_TIMEOUT_DAYS);
  return deadline;
}

export function ranksAreSequential(ranks: number[]) {
  const sorted = [...ranks].sort((a, b) => a - b);
  return sorted.length > 0 && sorted.every((rank, index) => rank === index + 1);
}
