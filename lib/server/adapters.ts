import type { ServerProcessingResponse } from "@/types/media";

export type AIEnhancementProvider = {
  enhanceImage(file: File): Promise<ServerProcessingResponse>;
  enhanceVideo(file: File): Promise<ServerProcessingResponse>;
};

export type ServerProcessingAdapter = {
  convertImage(file: File): Promise<ServerProcessingResponse>;
  convertVideo(file: File): Promise<ServerProcessingResponse>;
};

export type JobQueueAdapter = {
  enqueue(input: { feature: string; fileName: string }): Promise<ServerProcessingResponse>;
  cancel(jobId: string): Promise<{ ok: boolean }>;
};

export type AvifServerAdapter = {
  convertToHighQualityAvif(file: File): Promise<ServerProcessingResponse>;
};

export function notImplemented(feature: string): ServerProcessingResponse {
  return {
    mode: "not_implemented",
    feature,
    message: "이 기능은 MVP에서 계약만 준비되어 있으며 실제 서버 처리는 후속 단계에서 구현됩니다.",
  };
}
