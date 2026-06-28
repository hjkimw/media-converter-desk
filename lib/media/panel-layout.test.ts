import { describe, expect, it } from "vitest";
import { clampLeftPanelWidth, DEFAULT_LEFT_PANEL_WIDTH, MAX_LEFT_PANEL_WIDTH, MIN_LEFT_PANEL_WIDTH } from "./panel-layout";

describe("left panel layout sizing", () => {
  it("clamps the source queue width to the supported desktop range", () => {
    expect(MIN_LEFT_PANEL_WIDTH).toBe(380);
    expect(DEFAULT_LEFT_PANEL_WIDTH).toBe(440);
    expect(MAX_LEFT_PANEL_WIDTH).toBe(640);
    expect(clampLeftPanelWidth(120)).toBe(MIN_LEFT_PANEL_WIDTH);
    expect(clampLeftPanelWidth(440)).toBe(440);
    expect(clampLeftPanelWidth(900)).toBe(MAX_LEFT_PANEL_WIDTH);
  });

  it("falls back to the default width for invalid input", () => {
    expect(clampLeftPanelWidth(Number.NaN)).toBe(DEFAULT_LEFT_PANEL_WIDTH);
    expect(clampLeftPanelWidth(undefined)).toBe(DEFAULT_LEFT_PANEL_WIDTH);
  });
});
