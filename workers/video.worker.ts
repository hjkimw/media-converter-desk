import type { WorkerMessage } from "@/types/media";

self.addEventListener("message", (event: MessageEvent<WorkerMessage>) => {
  if (event.data.type === "process:cancel") {
    self.postMessage({
      type: "process:error",
      id: event.data.id,
      error: {
        code: "worker_not_enabled",
        message: "영상 Worker는 MVP에서 구조만 준비되어 있습니다. 현재 변환은 lazy-loaded FFmpeg.wasm 클라이언트를 사용합니다.",
      },
    } satisfies WorkerMessage);
  }
});
