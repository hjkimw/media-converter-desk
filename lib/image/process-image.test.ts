import { afterEach, describe, expect, it, vi } from "vitest";
import { decodeImageForCanvas } from "./process-image";

describe("decodeImageForCanvas", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to an HTML image when createImageBitmap cannot decode the file", async () => {
    class FakeImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      naturalWidth = 2;
      naturalHeight = 2;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }

    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();

    vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error("decode failed")));
    vi.stubGlobal("Image", FakeImage);
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    const decoded = await decodeImageForCanvas(new File(["x"], "sample.png", { type: "image/png" }));

    expect(decoded).toBeInstanceOf(FakeImage);
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });
});
