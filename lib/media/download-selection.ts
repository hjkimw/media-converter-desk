import type { ProcessResult, UploadedMedia } from "@/types/media";

export type DownloadDeliveryMode = "none" | "single" | "zip";

export type DownloadableMedia = {
  item: UploadedMedia;
  result: ProcessResult;
};

export function getDownloadDeliveryMode(itemCount: number): DownloadDeliveryMode {
  if (itemCount === 0) {
    return "none";
  }

  if (itemCount === 1) {
    return "single";
  }

  return "zip";
}

export async function collectDownloadableResults(
  items: UploadedMedia[],
  processItem: (item: UploadedMedia, index: number) => Promise<ProcessResult | undefined>,
) {
  const downloadableItems: DownloadableMedia[] = [];

  for (const [index, item] of items.entries()) {
    if (item.status === "processing" || item.status === "pending") {
      continue;
    }

    const result = item.result ?? (await processItem(item, index + 1));

    if (result) {
      downloadableItems.push({ item, result });
    }
  }

  return downloadableItems;
}
