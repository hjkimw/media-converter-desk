import type { ResizeOptions } from "@/types/media";

const IMAGE_PRESETS: Record<string, { width: number; height: number }> = {
  thumbnail: { width: 320, height: 320 },
  blog: { width: 1200, height: 800 },
  social: { width: 1080, height: 1080 },
  banner: { width: 1600, height: 600 },
  "1080p": { width: 1920, height: 1080 },
  "720p": { width: 1280, height: 720 },
  "480p": { width: 854, height: 480 },
};

export function resolveResizeDimensions(
  originalWidth: number,
  originalHeight: number,
  resize: ResizeOptions,
): { width: number; height: number } {
  if (resize.mode === "original") {
    return { width: originalWidth, height: originalHeight };
  }

  if (resize.mode === "percent") {
    const percent = resize.percent ?? 100;

    return {
      width: Math.max(1, Math.round((originalWidth * percent) / 100)),
      height: Math.max(1, Math.round((originalHeight * percent) / 100)),
    };
  }

  if (resize.mode === "preset" && resize.preset && IMAGE_PRESETS[resize.preset]) {
    return fitInside(originalWidth, originalHeight, IMAGE_PRESETS[resize.preset]);
  }

  const requestedWidth = resize.width;
  const requestedHeight = resize.height;

  if (resize.maintainAspectRatio) {
    if (requestedWidth && !requestedHeight) {
      return {
        width: requestedWidth,
        height: Math.max(1, Math.round((requestedWidth * originalHeight) / originalWidth)),
      };
    }

    if (!requestedWidth && requestedHeight) {
      return {
        width: Math.max(1, Math.round((requestedHeight * originalWidth) / originalHeight)),
        height: requestedHeight,
      };
    }
  }

  return {
    width: Math.max(1, Math.round(requestedWidth ?? originalWidth)),
    height: Math.max(1, Math.round(requestedHeight ?? originalHeight)),
  };
}

function fitInside(originalWidth: number, originalHeight: number, box: { width: number; height: number }) {
  const ratio = Math.min(box.width / originalWidth, box.height / originalHeight);

  return {
    width: Math.max(1, Math.round(originalWidth * ratio)),
    height: Math.max(1, Math.round(originalHeight * ratio)),
  };
}
