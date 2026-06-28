import { describe, expect, it } from "vitest";
import { createUniqueArchivePath, getFileRelativePath, getZipOutputPath } from "./archive";
import type { UploadedMedia } from "@/types/media";

describe("archive helpers", () => {
  it("preserves folder paths while replacing the final output filename", () => {
    const file = new File(["x"], "sample.png", { type: "image/png" });
    Object.defineProperty(file, "webkitRelativePath", {
      value: "campaign/raw/sample.png",
      configurable: true,
    });

    expect(getFileRelativePath(file)).toBe("campaign/raw/sample.png");
    expect(getZipOutputPath(createConvertedItem(file))).toBe("campaign/raw/sample-80x40-converted.webp");
  });

  it("falls back to the converted output name for regular file uploads", () => {
    const file = new File(["x"], "sample.png", { type: "image/png" });

    expect(getFileRelativePath(file)).toBeUndefined();
    expect(getZipOutputPath(createConvertedItem(file))).toBe("sample-80x40-converted.webp");
  });

  it("deduplicates archive paths without changing the directory", () => {
    const usedPaths = new Set<string>();

    expect(createUniqueArchivePath("campaign/raw/sample.webp", usedPaths)).toBe("campaign/raw/sample.webp");
    expect(createUniqueArchivePath("campaign/raw/sample.webp", usedPaths)).toBe("campaign/raw/sample-2.webp");
    expect(createUniqueArchivePath("campaign/raw/sample.webp", usedPaths)).toBe("campaign/raw/sample-3.webp");
  });
});

function createConvertedItem(file: File) {
  return {
    file,
    name: file.name,
    result: {
      blob: new Blob(["converted"], { type: "image/webp" }),
      objectUrl: "blob:converted",
      outputName: "sample-80x40-converted.webp",
      size: 9,
      mimeType: "image/webp",
      width: 80,
      height: 40,
    },
  } as UploadedMedia;
}
