import { describe, expect, it } from "vitest";
import { DEFAULT_IMAGE_OPTIONS } from "./media";

describe("default media options", () => {
  it("starts image quality at 100 for lossless-feeling MVP exports", () => {
    expect(DEFAULT_IMAGE_OPTIONS.quality).toBe(100);
  });
});
