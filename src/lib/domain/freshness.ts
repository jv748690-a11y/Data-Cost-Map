const DAY_MS = 86_400_000;

export const STALE_AFTER_DAYS = 30;
export const EXPIRED_AFTER_DAYS = 90;

export type Freshness = "fresh" | "stale" | "expired";

export function classifyFreshness(observedAt: Date, now: Date = new Date()): Freshness {
  const ageMs = now.getTime() - observedAt.getTime();
  if (Number.isNaN(ageMs)) throw new Error("Invalid date");
  if (ageMs < -DAY_MS) throw new Error("observedAt is in the future");

  const ageDays = ageMs / DAY_MS;
  if (ageDays >= EXPIRED_AFTER_DAYS) return "expired";
  if (ageDays >= STALE_AFTER_DAYS) return "stale";
  return "fresh";
}