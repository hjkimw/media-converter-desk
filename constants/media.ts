import type { ImageProcessOptions, VideoProcessOptions } from "@/types/media";

export const SUPPORTED_IMAGE_INPUTS = ["jpg", "jpeg", "png", "webp", "avif", "gif"] as const;
export const SUPPORTED_VIDEO_INPUTS = ["mp4", "mov", "webm", "mkv", "avi", "m4v"] as const;

export const IMAGE_OUTPUT_FORMATS = ["jpg", "png", "webp"] as const;
export const VIDEO_OUTPUT_FORMATS = ["mp4", "webm"] as const;

export const DESKTOP_VIDEO_LIMIT_BYTES = 100 * 1024 * 1024;
export const MOBILE_VIDEO_LIMIT_BYTES = 50 * 1024 * 1024;
export const DESKTOP_VIDEO_LIMIT_SECONDS = 120;
export const MOBILE_VIDEO_LIMIT_SECONDS = 60;

export const DEFAULT_IMAGE_OPTIONS: ImageProcessOptions = {
  outputFormat: "webp",
  quality: 80,
  resize: {
    mode: "original",
    maintainAspectRatio: true,
  },
  backgroundColor: "#ffffff",
  stripMetadata: true,
};

export const DEFAULT_VIDEO_OPTIONS: VideoProcessOptions = {
  // H.264/MP4 is the most reliable encoder in FFmpeg.wasm. VP9 (libvpx-vp9)
  // frequently triggers "memory access out of bounds" in the single-threaded
  // wasm core, so it stays available but is not the default.
  outputFormat: "mp4",
  videoCodec: "h264",
  crf: 23,
  resize: {
    mode: "original",
    maintainAspectRatio: true,
  },
};

export const ACCEPTED_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
  "video/x-msvideo",
  "video/mp4",
].join(",");
