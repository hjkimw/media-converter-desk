export type MediaType = "image" | "video";

export type ProcessStatus = "idle" | "pending" | "processing" | "completed" | "failed" | "cancelled";

export type ImageOutputFormat = "jpg" | "png" | "webp";

export type VideoOutputFormat = "mp4" | "webm";

export type VideoCodec = "h264" | "vp9";

export type ResizeMode = "original" | "percent" | "dimensions" | "preset";

export type ResizeOptions = {
  mode: ResizeMode;
  width?: number;
  height?: number;
  percent?: 25 | 50 | 75 | 100 | 150 | 200;
  preset?: "thumbnail" | "blog" | "social" | "banner" | "1080p" | "720p" | "480p";
  maintainAspectRatio: boolean;
};

export type ImageMetadata = {
  width: number;
  height: number;
  format: string;
  hasAlpha?: boolean;
};

export type VideoMetadata = {
  width: number;
  height: number;
  duration: number;
  fps?: number;
  hasAudio?: boolean;
  codec?: string;
};

export type ApiError = {
  code: string;
  message: string;
  detail?: string;
};

export type MediaWarning = {
  code: string;
  message: string;
};

export type ProcessResult = {
  blob: Blob;
  objectUrl: string;
  outputName: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
};

export type ImageProcessOptions = {
  outputFormat: ImageOutputFormat;
  quality: number;
  resize: ResizeOptions;
  backgroundColor: string;
  stripMetadata: boolean;
};

export type VideoProcessOptions = {
  outputFormat: VideoOutputFormat;
  videoCodec: VideoCodec;
  bitrateKbps?: number;
  crf?: number;
  resize: ResizeOptions;
};

export type UploadedMedia = {
  id: string;
  file: File;
  type: MediaType;
  name: string;
  size: number;
  mimeType: string;
  objectUrl: string;
  metadata?: ImageMetadata | VideoMetadata;
  status: ProcessStatus;
  progress: number;
  result?: ProcessResult;
  error?: ApiError;
  warnings: MediaWarning[];
};

export type ValidationResult =
  | { ok: true; mediaType: MediaType; warnings: MediaWarning[] }
  | { ok: false; error: ApiError };

export type BrowserVideoDecision =
  | { mode: "browser"; reason: string }
  | { mode: "server_recommended"; reason: string };

export type WorkerMessage =
  | { type: "process:start"; id: string }
  | { type: "process:progress"; id: string; progress: number }
  | { type: "process:complete"; id: string; result: ProcessResult }
  | { type: "process:error"; id: string; error: ApiError }
  | { type: "process:cancel"; id: string };

export type JobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";

export type ServerProcessingResponse =
  | { mode: "not_implemented"; feature: string; message: string }
  | { mode: "job"; jobId: string };
