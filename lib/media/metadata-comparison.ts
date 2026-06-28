import { formatBytes, formatDuration } from "@/lib/media/format";
import type { ImageMetadata, UploadedMedia, VideoMetadata } from "@/types/media";

export type MetadataComparisonRow = {
  label: string;
  before: string;
  after: string;
};

export function buildMetadataComparison(item: UploadedMedia): MetadataComparisonRow[] {
  const result = item.result;
  const rows: MetadataComparisonRow[] = [
    {
      label: "Size",
      before: formatBytes(item.size),
      after: result ? formatBytes(result.size) : "Not converted",
    },
    {
      label: "MIME",
      before: item.mimeType || "Unknown",
      after: result?.mimeType ?? "Not converted",
    },
  ];

  if (item.type === "image") {
    const metadata = item.metadata as ImageMetadata | undefined;
    rows.push({
      label: "Resolution",
      before: metadata ? `${metadata.width} x ${metadata.height}` : "Unknown",
      after: result?.width && result.height ? `${result.width} x ${result.height}` : "Not converted",
    });
    rows.push({
      label: "Format",
      before: metadata?.format ?? "Unknown",
      after: result?.outputName.split(".").pop()?.toUpperCase() ?? "Not converted",
    });
  }

  if (item.type === "video") {
    const metadata = item.metadata as VideoMetadata | undefined;
    rows.push({
      label: "Resolution",
      before: metadata ? `${metadata.width} x ${metadata.height}` : "Unknown",
      after: result?.width && result.height ? `${result.width} x ${result.height}` : "Not converted",
    });
    rows.push({
      label: "Duration",
      before: formatDuration(metadata?.duration),
      after: result?.duration ? formatDuration(result.duration) : "Not converted",
    });
  }

  return rows;
}
