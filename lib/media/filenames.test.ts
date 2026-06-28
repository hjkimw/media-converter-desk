import { describe, expect, it } from "vitest";
import { createOutputFilename, DEFAULT_FILENAME_TEMPLATE } from "./filenames";

describe("createOutputFilename", () => {
  it("preserves the original filename by default", () => {
    expect(
      createOutputFilename({
        originalName: "Vacation Photo.PNG",
        format: "webp",
        width: 800,
        height: 600,
      }),
    ).toBe("Vacation Photo.webp");
  });

  it("renders a custom output template with supported tokens", () => {
    expect(
      createOutputFilename({
        originalName: "Vacation Photo.PNG",
        format: "webp",
        width: 800,
        height: 600,
        index: 3,
        template: "export-{index}-{name}-{width}x{height}-{format}",
      }),
    ).toBe("export-3-Vacation Photo-800x600-webp.webp");
  });

  it("sanitizes unsafe template output and falls back when the template is empty", () => {
    expect(
      createOutputFilename({
        originalName: "raw:file?.png",
        format: "jpg",
        width: 120,
        height: 80,
        template: "{name}/bad:*?<>|",
      }),
    ).toBe("raw-file-bad.jpg");

    expect(
      createOutputFilename({
        originalName: "sample.png",
        format: "webp",
        template: "   ",
      }),
    ).toBe("sample.webp");
    expect(DEFAULT_FILENAME_TEMPLATE).toBe("{name}");
  });
});
