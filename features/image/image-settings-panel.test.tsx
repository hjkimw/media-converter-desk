import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImageSettingsPanel } from "./image-settings-panel";
import type { ImageProcessOptions } from "@/types/media";

describe("ImageSettingsPanel", () => {
  it("toggles the width and height ratio link from the dimensions row", () => {
    const onChange = vi.fn();
    const options = createOptions();

    render(<ImageSettingsPanel options={options} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle image aspect ratio link" }));

    expect(onChange).toHaveBeenCalledWith({
      resize: {
        ...options.resize,
        maintainAspectRatio: false,
      },
    });
  });
});

function createOptions(): ImageProcessOptions {
  return {
    outputFormat: "webp",
    quality: 100,
    resize: {
      mode: "dimensions",
      width: 1280,
      height: 720,
      maintainAspectRatio: true,
    },
    backgroundColor: "#ffffff",
    stripMetadata: true,
  };
}
