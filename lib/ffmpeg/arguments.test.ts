import { describe, expect, it } from "vitest";
import { buildVideoConvertArgs } from "./arguments";

describe("buildVideoConvertArgs", () => {
  it("builds MP4 arguments with H.264, scale, and bitrate", () => {
    expect(
      buildVideoConvertArgs({
        inputName: "input.mov",
        outputName: "output.mp4",
        outputFormat: "mp4",
        videoCodec: "h264",
        bitrateKbps: 1200,
        resize: {
          mode: "dimensions",
          width: 1280,
          height: 720,
          maintainAspectRatio: true,
        },
      }),
    ).toEqual([
      "-i",
      "input.mov",
      "-vf",
      "scale=1280:720",
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      "-b:v",
      "1200k",
      "-preset",
      "veryfast",
      "-movflags",
      "+faststart",
      "-pix_fmt",
      "yuv420p",
      "output.mp4",
    ]);
  });

  it("builds WEBM arguments with VP9 and CRF", () => {
    expect(
      buildVideoConvertArgs({
        inputName: "input.mp4",
        outputName: "output.webm",
        outputFormat: "webm",
        videoCodec: "vp9",
        crf: 34,
        resize: {
          mode: "original",
          maintainAspectRatio: true,
        },
      }),
    ).toEqual([
      "-i",
      "input.mp4",
      "-c:v",
      "libvpx-vp9",
      "-c:a",
      "libopus",
      "-crf",
      "34",
      "-b:v",
      "0",
      "-deadline",
      "good",
      "-cpu-used",
      "5",
      "output.webm",
    ]);
  });
});
