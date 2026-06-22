import { buildVideoConvertArgs } from "@/lib/ffmpeg/arguments";
import { createOutputFilename } from "@/lib/media/filenames";
import { resolveResizeDimensions } from "@/lib/media/resize";
import { getExtension } from "@/lib/validation/media-validation";
import type { ProcessResult, VideoMetadata, VideoProcessOptions } from "@/types/media";

const FFMPEG_CORE_VERSION = "0.12.10";

const MIME_BY_FORMAT = {
  mp4: "video/mp4",
  webm: "video/webm",
} as const;

let ffmpegInstance: import("@ffmpeg/ffmpeg").FFmpeg | null = null;
let ffmpegLoadPromise: Promise<import("@ffmpeg/ffmpeg").FFmpeg> | null = null;
let lastFfmpegLog = "";

export async function processVideoInBrowser(
  file: File,
  options: VideoProcessOptions,
  metadata: VideoMetadata,
  onProgress: (progress: number) => void,
): Promise<ProcessResult> {
  const ffmpeg = await getFfmpeg(onProgress);
  const { fetchFile } = await import("@ffmpeg/util");
  const inputExtension = getExtension(file.name) || "input";
  const inputName = `input.${inputExtension}`;
  const outputName = `output.${options.outputFormat}`;
  const dimensions = resolveResizeDimensions(metadata.width, metadata.height, options.resize);
  const resolvedOptions: VideoProcessOptions = {
    ...options,
    videoCodec: options.outputFormat === "mp4" ? "h264" : options.videoCodec,
    resize:
      options.resize.mode === "original"
        ? options.resize
        : {
            ...options.resize,
            width: dimensions.width,
            height: dimensions.height,
          },
  };

  onProgress(8);
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  onProgress(18);

  const exitCode = await ffmpeg.exec(
    buildVideoConvertArgs({
      ...resolvedOptions,
      inputName,
      outputName,
    }),
  );

  if (exitCode !== 0) {
    throw new Error(`FFmpeg exited with code ${exitCode}${lastFfmpegLog ? `: ${lastFfmpegLog}` : ""}`);
  }

  const data = await ffmpeg.readFile(outputName);
  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
  const blob = new Blob([bytes], { type: MIME_BY_FORMAT[options.outputFormat] });
  const objectUrl = URL.createObjectURL(blob);

  await Promise.allSettled([ffmpeg.deleteFile(inputName), ffmpeg.deleteFile(outputName)]);
  onProgress(100);

  return {
    blob,
    objectUrl,
    outputName: createOutputFilename({
      originalName: file.name,
      format: options.outputFormat,
      width: dimensions.width,
      height: dimensions.height,
    }),
    size: blob.size,
    mimeType: MIME_BY_FORMAT[options.outputFormat],
    width: dimensions.width,
    height: dimensions.height,
    duration: metadata.duration,
  };
}

async function getFfmpeg(onProgress: (progress: number) => void) {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = loadFfmpeg(onProgress);
  }

  ffmpegInstance = await ffmpegLoadPromise;

  return ffmpegInstance;
}

async function loadFfmpeg(onProgress: (progress: number) => void) {
  const [{ FFmpeg }, { toBlobURL }] = await Promise.all([import("@ffmpeg/ffmpeg"), import("@ffmpeg/util")]);
  const ffmpeg = new FFmpeg();
  const baseUrl = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd`;

  ffmpeg.on("progress", ({ progress }) => {
    onProgress(Math.min(98, Math.max(20, Math.round(progress * 98))));
  });
  ffmpeg.on("log", ({ message }) => {
    if (message.trim()) {
      lastFfmpegLog = message.trim();
    }
  });

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseUrl}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseUrl}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return ffmpeg;
}
