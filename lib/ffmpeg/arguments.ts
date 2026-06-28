import type { VideoProcessOptions } from "@/types/media";

type BuildVideoConvertArgsInput = VideoProcessOptions & {
  inputName: string;
  outputName: string;
};

const VIDEO_CODEC_ARGS = {
  h264: "libx264",
  vp9: "libvpx-vp9",
} as const;

export function buildVideoConvertArgs({
  inputName,
  outputName,
  outputFormat,
  videoCodec,
  bitrateKbps,
  crf,
  resize,
}: BuildVideoConvertArgsInput) {
  const args = ["-i", inputName];

  if (resize.mode !== "original" && resize.width && resize.height) {
    args.push("-vf", `scale=${resize.width}:${resize.height}`);
  }

  args.push("-c:v", VIDEO_CODEC_ARGS[videoCodec]);

  if (crf !== undefined) {
    args.push("-crf", String(crf));
  }

  if (bitrateKbps !== undefined && !(outputFormat === "webm" && crf !== undefined)) {
    args.push("-b:v", `${bitrateKbps}k`);
  }

  if (outputFormat === "webm" && crf !== undefined) {
    args.push("-b:v", "0");
  }

  if (outputFormat === "mp4") {
    args.push("-preset", "veryfast", "-movflags", "+faststart");
  }

  args.push(outputName);

  return args;
}
