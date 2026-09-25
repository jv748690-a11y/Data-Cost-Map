import { describe, it, expect } from "vitest";
import { classifyFreshness } from "../../src/lib/domain/freshness";

const now = new Date("2026-09-24T00:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

describe("classifyFreshness", () => {
  it("marks recent prices as fresh", () => {
    expect(classifyFreshness(daysAgo(10), now)).toBe("fresh");
  });

  it("marks prices exactly 30 days old as stale", () => {
    expect(classifyFreshness(daysAgo(30), now)).toBe("stale");
  });

  it("keeps prices up to 89 days old as stale", () => {
    expect(classifyFreshness(daysAgo(89), now)).toBe("stale");
  });

  it("marks prices 90 days or older as expired", () => {
    expect(classifyFreshness(daysAgo(90), now)).toBe("expired");
  });

  it("rejects dates more than a day in the future", () => {
    expect(() => classifyFreshness(daysAgo(-5), now)).toThrow();
  });
});