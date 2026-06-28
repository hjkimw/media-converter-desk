import { describe, expect, it } from "vitest";
import { buildMetadataComparison } from "./metadata-comparison";
import type { UploadedMedia } from "@/types/media";

describe("buildMetadataComparison", () => {
  it("compares image size, MIME, resolution, and output format", () => {
    const item = {
      type: "image",
      size: 1000,
      mimeType: "image/png",
      metadata: { width: 100, height: 50, format: "PNG" },
      result: {
        size: 500,
        mimeType: "image/webp",
        width: 50,
        height: 25,
        outputName: "sample-50x25-converted.webp",
      },
    } as UploadedMedia;

    expect(buildMetadataComparison(item)).toEqual([
      { label: "Size", before: "1000 B", after: "500 B" },
      { label: "MIME", before: "image/png", after: "image/webp" },
      { label: "Resolution", before: "100 x 50", after: "50 x 25" },
      { label: "Format", before: "PNG", after: "WEBP" },
    ]);
  });
});
