import { createOutputFilename } from "@/lib/media/filenames";
import { resolveResizeDimensions } from "@/lib/media/resize";
import type { ImageMetadata, ImageProcessOptions, ProcessResult } from "@/types/media";

const MIME_BY_FORMAT = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

export async function processImageInBrowser(
  file: File,
  options: ImageProcessOptions,
  metadata: ImageMetadata,
  onProgress: (progress: number) => void,
): Promise<ProcessResult> {
  onProgress(12);
  const bitmap = await decodeImageForCanvas(file);
  const dimensions = resolveResizeDimensions(metadata.width, metadata.height, options.resize);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: options.outputFormat !== "jpg" });

  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  onProgress(35);

  if (options.outputFormat === "jpg") {
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(bitmap, 0, 0, dimensions.width, dimensions.height);
  closeBitmap(bitmap);
  onProgress(72);

  const mimeType = MIME_BY_FORMAT[options.outputFormat];
  const blob = await canvasToBlob(canvas, mimeType, options.outputFormat === "png" ? undefined : options.quality / 100);
  const objectUrl = URL.createObjectURL(blob);

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
    mimeType,
    width: dimensions.width,
    height: dimensions.height,
  };
}

export async function decodeImageForCanvas(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in globalThis) {
    try {
      return await createImageBitmap(file);
    } catch {
      // Some browser builds fail createImageBitmap for files that HTMLImageElement can still render.
    }
  }

  const url = URL.createObjectURL(file);

  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Unable to decode image."));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function closeBitmap(bitmap: ImageBitmap | HTMLImageElement) {
  if ("close" in bitmap) {
    bitmap.close();
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image encoding failed."));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}
