import { describe, it, expect } from "vitest";
import { aggregateObservations, type Observation } from "../../src/lib/domain/aggregate";

const now = new Date("2026-09-24T00:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

const obs = (
  priceMinor: number,
  status: Observation["status"],
  ageDays: number
): Observation => ({ priceMinor, dataMb: 1024, observedAt: daysAgo(ageDays), status });

describe("aggregateObservations", () => {
  it("returns null when there is no usable data", () => {
    const result = aggregateObservations([], now);
    expect(result.medianPricePerGb).toBeNull();
    expect(result.sampleCount).toBe(0);
  });

  it("ignores rejected and expired observations", () => {
    const result = aggregateObservations(
      [obs(100000, "verified", 5), obs(300000, "rejected", 5), obs(50000, "pending", 100)],
      now
    );
    expect(result.sampleCount).toBe(1);
    expect(result.medianPricePerGb).toBe(100000);
  });

  it("drops outliers and splits verified from unverified", () => {
    const result = aggregateObservations(
      [
        obs(100000, "verified", 2),
        obs(102000, "verified", 3),
        obs(98000, "pending", 4),
        obs(101000, "pending", 5),
        obs(99000, "pending", 6),
        obs(1000000, "pending", 7),
      ],
      now
    );
    expect(result.sampleCount).toBe(5);
    expect(result.medianPricePerGb).toBe(100000);
    expect(result.verifiedCount).toBe(2);
    expect(result.unverifiedCount).toBe(3);
  });

  it("counts stale observations that are still included", () => {
    const result = aggregateObservations([obs(100000, "verified", 40)], now);
    expect(result.sampleCount).toBe(1);
    expect(result.staleCount).toBe(1);
  });

  it("skips invalid rows instead of crashing", () => {
    const result = aggregateObservations(
      [obs(100000, "verified", 5), obs(100000, "pending", -10)],
      now
    );
    expect(result.sampleCount).toBe(1);
    expect(result.invalidCount).toBe(1);
  });
});