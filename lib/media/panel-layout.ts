export const MIN_LEFT_PANEL_WIDTH = 380;
export const DEFAULT_LEFT_PANEL_WIDTH = 440;
export const MAX_LEFT_PANEL_WIDTH = 640;
export const LEFT_PANEL_WIDTH_STORAGE_KEY = "media-convert-left-panel-width";
export const INSPECTOR_OPEN_STORAGE_KEY = "media-convert-inspector-open";

export function clampLeftPanelWidth(width?: number) {
  if (!Number.isFinite(width)) {
    return DEFAULT_LEFT_PANEL_WIDTH;
  }

  return Math.min(MAX_LEFT_PANEL_WIDTH, Math.max(MIN_LEFT_PANEL_WIDTH, Math.round(width as number)));
}

export function readStoredLeftPanelWidth(storage: Storage) {
  const value = Number(storage.getItem(LEFT_PANEL_WIDTH_STORAGE_KEY));

  return clampLeftPanelWidth(value);
}

export function writeStoredLeftPanelWidth(storage: Storage, width: number) {
  storage.setItem(LEFT_PANEL_WIDTH_STORAGE_KEY, String(clampLeftPanelWidth(width)));
}

export function readStoredInspectorOpen(storage: Storage) {
  return storage.getItem(INSPECTOR_OPEN_STORAGE_KEY) === "true";
}

export function writeStoredInspectorOpen(storage: Storage, isOpen: boolean) {
  storage.setItem(INSPECTOR_OPEN_STORAGE_KEY, String(isOpen));
}
