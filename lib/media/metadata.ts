import type { ImageMetadata, VideoMetadata } from "@/types/media";
import { getExtension } from "@/lib/validation/media-validation";

export async function extractImageMetadata(file: File, objectUrl: string): Promise<ImageMetadata> {
  const image = await loadImage(objectUrl);

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    format: getExtension(file.name).toUpperCase() || file.type.replace("image/", "").toUpperCase(),
    hasAlpha: ["png", "webp", "avif", "gif"].includes(getExtension(file.name)),
  };
}

export async function extractVideoMetadata(file: File, objectUrl: string): Promise<VideoMetadata> {
  const video = document.createElement("video");

  video.preload = "metadata";
  video.muted = true;
  video.src = objectUrl;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Unable to read video metadata."));
  });

  return {
    width: video.videoWidth,
    height: video.videoHeight,
    duration: video.duration,
    fps: undefined,
    hasAudio: undefined,
    codec: file.type || getExtension(file.name).toUpperCase(),
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to decode image."));
    image.src = src;
  });
}
