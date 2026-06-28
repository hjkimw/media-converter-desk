import { describe, expect, it } from "vitest";
import { formatBytesWithExact, formatPercentChange } from "./format";

describe("formatBytesWithExact", () => {
  it("keeps the rounded display size and exact byte count together", () => {
    expect(formatBytesWithExact(1153)).toBe("1.1 KB (1,153 bytes)");
  });

  it("uses a singular byte label for one byte", () => {
    expect(formatBytesWithExact(1)).toBe("1 B (1 byte)");
  });
});

describe("formatPercentChange", () => {
  it("reports larger outputs instead of calling them smaller", () => {
    expect(formatPercentChange(100, 150)).toBe("50.0% larger");
  });
});
