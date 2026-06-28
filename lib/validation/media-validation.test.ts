import { describe, expect, it } from "vitest";
import { classifyMediaFile, validateMediaFile } from "./media-validation";

describe("media validation", () => {
  it("classifies supported image and video files from MIME and extension", () => {
    expect(classifyMediaFile(new File(["x"], "photo.JPG", { type: "image/jpeg" }))).toBe("image");
    expect(classifyMediaFile(new File(["x"], "clip.webm", { type: "video/webm" }))).toBe("video");
  });

  it("rejects unsupported files with a user-facing error code", () => {
    const result = validateMediaFile(new File(["x"], "notes.pdf", { type: "application/pdf" }));

    expect(result.ok).toBe(false);
    expect(result.ok ? undefined : result.error.code).toBe("unsupported_file_type");
  });

  it("warns when a video exceeds the browser MVP limit", () => {
    const bytes = new Uint8Array(101 * 1024 * 1024);
    const result = validateMediaFile(new File([bytes], "large.mp4", { type: "video/mp4" }));

    expect(result.ok).toBe(true);
    expect(result.ok ? result.warnings[0]?.code : undefined).toBe("server_recommended");
  });
});
