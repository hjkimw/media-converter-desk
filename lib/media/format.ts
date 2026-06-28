export function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatBytesWithExact(bytes: number) {
  const byteLabel = bytes === 1 ? "byte" : "bytes";

  return `${formatBytes(bytes)} (${formatWholeNumber(bytes)} ${byteLabel})`;
}

export function formatDuration(seconds?: number) {
  if (!Number.isFinite(seconds) || seconds === undefined) {
    return "Unknown";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatPercentChange(original: number, result?: number) {
  if (!result || original <= 0) {
    return "Waiting";
  }

  if (result === original) {
    return "No size change";
  }

  if (result > original) {
    const increase = (result / original - 1) * 100;

    return `${increase.toFixed(1)}% larger`;
  }

  const reduction = (1 - result / original) * 100;

  return `${reduction.toFixed(1)}% smaller`;
}

function formatWholeNumber(value: number) {
  return Math.trunc(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
