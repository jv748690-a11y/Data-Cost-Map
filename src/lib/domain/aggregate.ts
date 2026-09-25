import { pricePerGb } from "./pricing";
import { filterOutliers, median } from "./stats";
import { classifyFreshness, type Freshness } from "./freshness";

export type ObservationStatus = "pending" | "verified" | "rejected" | "stale";

export interface Observation {
  priceMinor: number;
  dataMb: number;
  observedAt: Date;
  status: ObservationStatus;
}

export interface AggregateResult {
  medianPricePerGb: number | null;
  sampleCount: number;
  verifiedCount: number;
  unverifiedCount: number;
  staleCount: number;
  invalidCount: number;
}

interface Entry {
  perGb: number;
  status: ObservationStatus;
  freshness: Freshness;
}

export function aggregateObservations(
  observations: Observation[],
  now: Date = new Date()
): AggregateResult {
  const entries: Entry[] = [];
  let invalidCount = 0;

  for (const o of observations) {
    if (o.status === "rejected") continue;
    try {
      const freshness = classifyFreshness(o.observedAt, now);
      if (freshness === "expired") continue;
      entries.push({
        perGb: pricePerGb(o.priceMinor, o.dataMb),
        status: o.status,
        freshness,
      });
    } catch {
      invalidCount++;
    }
  }

  const allowed = filterOutliers(entries.map((e) => e.perGb));
  const kept = entries.filter((e) => allowed.includes(e.perGb));

  const verifiedCount = kept.filter((e) => e.status === "verified").length;

  return {
    medianPricePerGb: kept.length > 0 ? median(kept.map((e) => e.perGb)) : null,
    sampleCount: kept.length,
    verifiedCount,
    unverifiedCount: kept.length - verifiedCount,
    staleCount: kept.filter((e) => e.freshness === "stale").length,
    invalidCount,
  };
}