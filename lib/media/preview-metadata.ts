import type { ImageMetadata, UploadedMedia, VideoMetadata } from "@/types/media";
import { formatBytesWithExact, formatDuration, formatPercentChange } from "@/lib/media/format";

export type PreviewMetadataRow = {
  label: string;
  value: string;
};

export function buildPreviewMetadata(item: UploadedMedia) {
  return {
    before: buildBeforeMetadata(item),
    after: buildAfterMetadata(item),
  };
}

function buildBeforeMetadata(item: UploadedMedia): PreviewMetadataRow[] {
  if (item.type === "image" && item.metadata) {
    const metadata = item.metadata as ImageMetadata;

    return buildImageRows({
      fileName: item.name,
      fileSize: formatBytesWithExact(item.size),
      format: normalizeFormat(metadata.format) || formatFromNameOrMime(item.name, item.mimeType),
      mime: item.mimeType || "Unknown",
      dimensions: formatDimensions(metadata.width, metadata.height),
      alpha: formatAlpha(metadata.hasAlpha),
      change: "Original",
    });
  }

  if (item.type === "video" && item.metadata) {
    const metadata = item.metadata as VideoMetadata;

    return buildVideoRows({
      fileName: item.name,
      fileSize: formatBytesWithExact(item.size),
      format: formatFromNameOrMime(item.name, item.mimeType),
      mime: item.mimeType || "Unknown",
      dimensions: formatDimensions(metadata.width, metadata.height),
      duration: formatDuration(metadata.duration),
      fps: metadata.fps ? String(metadata.fps) : "Unknown",
      audio: formatAudio(metadata.hasAudio),
      change: "Original",
    });
  }

  return buildFallbackRows(item);
}

function buildAfterMetadata(item: UploadedMedia): PreviewMetadataRow[] {
  if (!item.result) {
    return buildPlaceholderRows(item.type);
  }

  if (item.type === "image") {
    return buildImageRows({
      fileName: item.result.outputName,
      fileSize: formatBytesWithExact(item.result.size),
      format: formatFromNameOrMime(item.result.outputName, item.result.mimeType),
      mime: item.result.mimeType || "Unknown",
      dimensions: formatDimensions(item.result.width, item.result.height),
      alpha: "Unknown",
      change: formatPercentChange(item.size, item.result.size),
    });
  }

  const sourceVideoMetadata = item.metadata as VideoMetadata | undefined;

  return buildVideoRows({
    fileName: item.result.outputName,
    fileSize: formatBytesWithExact(item.result.size),
    format: formatFromNameOrMime(item.result.outputName, item.result.mimeType),
    mime: item.result.mimeType || "Unknown",
    dimensions: formatDimensions(item.result.width, item.result.height),
    duration: formatDuration(item.result.duration ?? sourceVideoMetadata?.duration),
    fps: sourceVideoMetadata?.fps ? String(sourceVideoMetadata.fps) : "Unknown",
    audio: formatAudio(sourceVideoMetadata?.hasAudio),
    change: formatPercentChange(item.size, item.result.size),
  });
}

function buildImageRows(values: {
  fileName: string;
  fileSize: string;
  format: string;
  mime: string;
  dimensions: string;
  alpha: string;
  change: string;
}): PreviewMetadataRow[] {
  return [
    { label: "File Name", value: values.fileName },
    { label: "File Size", value: values.fileSize },
    { label: "Format", value: values.format },
    { label: "MIME", value: values.mime },
    { label: "Dimensions", value: values.dimensions },
    { label: "Alpha", value: values.alpha },
    { label: "Change", value: values.change },
  ];
}

function buildVideoRows(values: {
  fileName: string;
  fileSize: string;
  format: string;
  mime: string;
  dimensions: string;
  duration: string;
  fps: string;
  audio: string;
  change: string;
}): PreviewMetadataRow[] {
  return [
    { label: "File Name", value: values.fileName },
    { label: "File Size", value: values.fileSize },
    { label: "Format", value: values.format },
    { label: "MIME", value: values.mime },
    { label: "Dimensions", value: values.dimensions },
    { label: "Duration", value: values.duration },
    { label: "FPS", value: values.fps },
    { label: "Audio", value: values.audio },
    { label: "Change", value: values.change },
  ];
}

function buildPlaceholderRows(mediaType: UploadedMedia["type"]): PreviewMetadataRow[] {
  if (mediaType === "video") {
    return buildVideoRows({
      fileName: "변환 후 표시",
      fileSize: "-",
      format: "-",
      mime: "-",
      dimensions: "-",
      duration: "-",
      fps: "-",
      audio: "-",
      change: "-",
    });
  }

  return buildImageRows({
    fileName: "변환 후 표시",
    fileSize: "-",
    format: "-",
    mime: "-",
    dimensions: "-",
    alpha: "-",
    change: "-",
  });
}

function buildFallbackRows(item: UploadedMedia): PreviewMetadataRow[] {
  if (item.type === "video") {
    return buildVideoRows({
      fileName: item.name,
      fileSize: formatBytesWithExact(item.size),
      format: formatFromNameOrMime(item.name, item.mimeType),
      mime: item.mimeType || "Unknown",
      dimensions: "-",
      duration: "-",
      fps: "-",
      audio: "-",
      change: "Original",
    });
  }

  return buildImageRows({
    fileName: item.name,
    fileSize: formatBytesWithExact(item.size),
    format: formatFromNameOrMime(item.name, item.mimeType),
    mime: item.mimeType || "Unknown",
    dimensions: "-",
    alpha: "-",
    change: "Original",
  });
}

function formatDimensions(width?: number, height?: number) {
  if (!width || !height) {
    return "-";
  }

  return `${width} x ${height}`;
}

function normalizeFormat(format?: string) {
  return format?.replace(/^\./, "").toUpperCase() ?? "";
}

function formatFromNameOrMime(name?: string, mimeType?: string) {
  const extension = name?.split(".").pop();
  const mimeFormat = mimeType?.split("/").pop();

  return normalizeFormat(extension || mimeFormat) || "Unknown";
}

function formatAlpha(hasAlpha?: boolean) {
  if (hasAlpha === undefined) {
    return "Unknown";
  }

  return hasAlpha ? "Likely" : "No";
}

function formatAudio(hasAudio?: boolean) {
  if (hasAudio === undefined) {
    return "Unknown";
  }

  return hasAudio ? "Yes" : "No";
}
