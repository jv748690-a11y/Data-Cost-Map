import { describe, it, expect } from "vitest";
import { median, filterOutliers } from "../../src/lib/domain/stats";

describe("median", () => {
  it("handles an odd number of values", () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it("averages the middle two for an even count", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it("throws on an empty list", () => {
    expect(() => median([])).toThrow();
  });
});

describe("filterOutliers", () => {
  it("removes an extreme value", () => {
    expect(filterOutliers([100, 102, 98, 101, 99, 1000])).toEqual([100, 102, 98, 101, 99]);
  });

  it("keeps everything when there are fewer than 4 values", () => {
    expect(filterOutliers([100, 5000, 120])).toEqual([100, 5000, 120]);
  });

  it("keeps everything when the MAD is zero", () => {
    expect(filterOutliers([100, 100, 100, 100, 500])).toEqual([100, 100, 100, 100, 500]);
  });
});