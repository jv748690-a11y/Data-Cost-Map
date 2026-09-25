import { describe, it, expect } from "vitest";
import { pricePerGb } from "../../src/lib/domain/pricing";

describe("pricePerGb", () => {
  it("returns the price for exactly 1 GB", () => {
    expect(pricePerGb(100000, 1024)).toBe(100000);
  });

  it("scales larger bundles down to a per-GB price", () => {
    expect(pricePerGb(200000, 2048)).toBe(100000);
  });

  it("handles sub-GB bundles", () => {
    expect(pricePerGb(50000, 500)).toBe(102400);
  });

  it("rejects invalid input", () => {
    expect(() => pricePerGb(0, 1024)).toThrow();
    expect(() => pricePerGb(1000, 0)).toThrow();
    expect(() => pricePerGb(10.5, 1024)).toThrow();
  });
});