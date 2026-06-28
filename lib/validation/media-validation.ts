import {
  DESKTOP_VIDEO_LIMIT_BYTES,
  SUPPORTED_IMAGE_INPUTS,
  SUPPORTED_VIDEO_INPUTS,
} from "@/constants/media";
import type { MediaType, ValidationResult } from "@/types/media";

const IMAGE_MIME_PREFIX = "image/";
const VIDEO_MIME_PREFIX = "video/";
const SUPPORTED_IMAGE_EXTENSIONS = new Set<string>(SUPPORTED_IMAGE_INPUTS);
const SUPPORTED_VIDEO_EXTENSIONS = new Set<string>(SUPPORTED_VIDEO_INPUTS);

export function classifyMediaFile(file: File): MediaType | null {
  const extension = getExtension(file.name);

  if (file.type.startsWith(IMAGE_MIME_PREFIX) || SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
    return SUPPORTED_IMAGE_EXTENSIONS.has(extension) || file.type.startsWith(IMAGE_MIME_PREFIX) ? "image" : null;
  }

  if (file.type.startsWith(VIDEO_MIME_PREFIX) || SUPPORTED_VIDEO_EXTENSIONS.has(extension)) {
    return SUPPORTED_VIDEO_EXTENSIONS.has(extension) || file.type.startsWith(VIDEO_MIME_PREFIX) ? "video" : null;
  }

  return null;
}

export function validateMediaFile(file: File): ValidationResult {
  const mediaType = classifyMediaFile(file);

  if (!mediaType) {
    return {
      ok: false,
      error: {
        code: "unsupported_file_type",
        message: "지원하지 않는 파일 형식입니다. JPG, PNG, WEBP, AVIF, GIF, MP4, MOV, WEBM 파일을 사용해 주세요.",
      },
    };
  }

  const warnings = [];

  if (mediaType === "video" && file.size > DESKTOP_VIDEO_LIMIT_BYTES) {
    warnings.push({
      code: "server_recommended",
      message: "100MB를 초과하는 영상은 브라우저 처리보다 서버 FFmpeg 처리가 적합합니다.",
    });
  }

  return { ok: true, mediaType, warnings };
}

export function getExtension(filename: string) {
  const dotIndex = filename.lastIndexOf(".");

  return dotIndex >= 0 ? filename.slice(dotIndex + 1).toLowerCase() : "";
}
