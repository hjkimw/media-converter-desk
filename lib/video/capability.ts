import {
  DESKTOP_VIDEO_LIMIT_BYTES,
  DESKTOP_VIDEO_LIMIT_SECONDS,
  MOBILE_VIDEO_LIMIT_BYTES,
  MOBILE_VIDEO_LIMIT_SECONDS,
} from "@/constants/media";
import type { BrowserVideoDecision } from "@/types/media";

type BrowserVideoDecisionInput = {
  fileSize: number;
  duration?: number;
  isMobile: boolean;
};

export function getBrowserVideoDecision({
  fileSize,
  duration,
  isMobile,
}: BrowserVideoDecisionInput): BrowserVideoDecision {
  const maxBytes = isMobile ? MOBILE_VIDEO_LIMIT_BYTES : DESKTOP_VIDEO_LIMIT_BYTES;
  const maxSeconds = isMobile ? MOBILE_VIDEO_LIMIT_SECONDS : DESKTOP_VIDEO_LIMIT_SECONDS;
  const sizeLabel = isMobile ? "50MB" : "100MB";
  const durationLabel = isMobile ? "1분" : "2분";

  if (fileSize > maxBytes) {
    return {
      mode: "server_recommended",
      reason: `${sizeLabel}를 초과하는 영상은 서버 처리로 넘기는 것이 안전합니다.`,
    };
  }

  if (duration !== undefined && duration > maxSeconds) {
    return {
      mode: "server_recommended",
      reason: `${durationLabel}보다 긴 영상은 브라우저 메모리 사용량이 커질 수 있습니다.`,
    };
  }

  return {
    mode: "browser",
    reason: "작은 영상 클립은 브라우저 FFmpeg.wasm으로 처리합니다.",
  };
}
