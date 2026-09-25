import { describe, it, expect } from "vitest";
import { parseDataSizeMb, parseValidityDays } from "../../src/lib/domain/normalize";

describe("parseDataSizeMb", () => {
  it("parses common formats", () => {
    expect(parseDataSizeMb("500MB")).toBe(500);
    expect(parseDataSizeMb("1GB")).toBe(1024);
    expect(parseDataSizeMb("1.5 GB")).toBe(1536);
    expect(parseDataSizeMb("2gb")).toBe(2048);
    expect(parseDataSizeMb("1TB")).toBe(1048576);
  });

  it("rejects invalid input", () => {
    expect(() => parseDataSizeMb("abc")).toThrow();
    expect(() => parseDataSizeMb("")).toThrow();
    expect(() => parseDataSizeMb("-1GB")).toThrow();
    expect(() => parseDataSizeMb("0MB")).toThrow();
  });
});

describe("parseValidityDays", () => {
  it("parses common formats", () => {
    expect(parseValidityDays("1 day")).toBe(1);
    expect(parseValidityDays("7 days")).toBe(7);
    expect(parseValidityDays("1 week")).toBe(7);
    expect(parseValidityDays("1 month")).toBe(30);
    expect(parseValidityDays("24 hours")).toBe(1);
    expect(parseValidityDays("12hrs")).toBe(1);
  });

  it("rejects invalid input", () => {
    expect(() => parseValidityDays("forever")).toThrow();
    expect(() => parseValidityDays("0 days")).toThrow();
  });
});