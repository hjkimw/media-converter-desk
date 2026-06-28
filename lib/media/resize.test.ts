import { describe, expect, it } from "vitest";
import { resolveResizeDimensions } from "./resize";

describe("resolveResizeDimensions", () => {
  it("keeps original dimensions when resize mode is original", () => {
    expect(
      resolveResizeDimensions(1920, 1080, {
        mode: "original",
        maintainAspectRatio: true,
      }),
    ).toEqual({ width: 1920, height: 1080 });
  });

  it("calculates percentage resize dimensions", () => {
    expect(
      resolveResizeDimensions(1200, 800, {
        mode: "percent",
        percent: 50,
        maintainAspectRatio: true,
      }),
    ).toEqual({ width: 600, height: 400 });
  });

  it("preserves aspect ratio when only width is provided", () => {
    expect(
      resolveResizeDimensions(1600, 900, {
        mode: "dimensions",
        width: 800,
        maintainAspectRatio: true,
      }),
    ).toEqual({ width: 800, height: 450 });
  });
});
