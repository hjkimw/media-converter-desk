import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VideoSettingsPanel } from "./video-settings-panel";
import type { VideoProcessOptions } from "@/types/media";

describe("VideoSettingsPanel", () => {
  it("toggles the width and height ratio link from the dimensions row", () => {
    const onChange = vi.fn();
    const options = createOptions();

    render(<VideoSettingsPanel options={options} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle video aspect ratio link" }));

    expect(onChange).toHaveBeenCalledWith({
      resize: {
        ...options.resize,
        maintainAspectRatio: false,
      },
    });
  });
});

function createOptions(): VideoProcessOptions {
  return {
    outputFormat: "webm",
    videoCodec: "vp9",
    bitrateKbps: 1600,
    crf: 32,
    resize: {
      mode: "dimensions",
      width: 1280,
      height: 720,
      maintainAspectRatio: true,
    },
  };
}
