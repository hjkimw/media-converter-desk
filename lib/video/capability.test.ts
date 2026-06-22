import { describe, expect, it } from "vitest";
import { getBrowserVideoDecision } from "./capability";

describe("getBrowserVideoDecision", () => {
  it("allows small desktop clips in the browser", () => {
    expect(
      getBrowserVideoDecision({
        fileSize: 25 * 1024 * 1024,
        duration: 45,
        isMobile: false,
      }).mode,
    ).toBe("browser");
  });

  it("recommends server processing for large or long videos", () => {
    const decision = getBrowserVideoDecision({
      fileSize: 160 * 1024 * 1024,
      duration: 60,
      isMobile: false,
    });

    expect(decision.mode).toBe("server_recommended");
    expect(decision.reason).toContain("100MB");
  });
});
