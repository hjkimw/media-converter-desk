import { describe, expect, it } from "vitest";
import { formatPercentChange } from "./format";

describe("formatPercentChange", () => {
  it("reports larger outputs instead of calling them smaller", () => {
    expect(formatPercentChange(100, 150)).toBe("50.0% larger");
  });
});
