"use client";

import { DEFAULT_IMAGE_OPTIONS, DEFAULT_VIDEO_OPTIONS } from "@/constants/media";
import { DEFAULT_ARCHIVE_NAME } from "@/lib/media/archive";
import { createOutputFilename, DEFAULT_FILENAME_TEMPLATE } from "@/lib/media/filenames";
import { getMediaFolderKey, LOOSE_MEDIA_GROUP_KEY, renameMediaFolder } from "@/lib/media/folders";
import { reorderGroupsByKey, reorderItemsById, type ReorderPlacement } from "@/lib/media/reorder";
import type {
  ApiError,
  ImageProcessOptions,
  ProcessResult,
  ProcessStatus,
  UploadedMedia,
  VideoProcessOptions,
} from "@/types/media";
import { create } from "zustand";

type MediaStore = {
  items: UploadedMedia[];
  selectedId?: string;
  imageOptions: ImageProcessOptions;
  videoOptions: VideoProcessOptions;
  filenameTemplate: string;
  archiveName: string;
  addItem: (item: UploadedMedia) => void;
  removeItem: (id: string) => void;
  updateItemName: (id: string, name: string) => void;
  renameFolderGroup: (folderKey: string, name: string) => void;
  reorderItems: (sourceId: string, targetId: string, placement?: ReorderPlacement) => void;
  reorderGroups: (sourceGroupKey: string, targetGroupKey: string, placement?: ReorderPlacement) => void;
  clearItems: () => void;
  selectItem: (id: string) => void;
  updateStatus: (id: string, status: ProcessStatus, progress?: number) => void;
  updateProgress: (id: string, progress: number) => void;
  setResult: (id: string, result: ProcessResult) => void;
  setError: (id: string, error: ApiError) => void;
  updateImageOptions: (options: Partial<ImageProcessOptions>) => void;
  updateVideoOptions: (options: Partial<VideoProcessOptions>) => void;
  updateFilenameTemplate: (template: string) => void;
  updateArchiveName: (name: string) => void;
  renameResults: (ids: string[]) => void;
};

export const useMediaStore = create<MediaStore>((set) => ({
  items: [],
  selectedId: undefined,
  imageOptions: DEFAULT_IMAGE_OPTIONS,
  videoOptions: DEFAULT_VIDEO_OPTIONS,
  filenameTemplate: DEFAULT_FILENAME_TEMPLATE,
  archiveName: DEFAULT_ARCHIVE_NAME,
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
      selectedId: state.selectedId ?? item.id,
    })),
  removeItem: (id) =>
    set((state) => {
      const item = state.items.find((candidate) => candidate.id === id);
      revokeMediaUrls(item);
      const items = state.items.filter((candidate) => candidate.id !== id);

      return {
        items,
        selectedId: state.selectedId === id ? items[0]?.id : state.selectedId,
      };
    }),
  updateItemName: (id, name) => {
    const nextName = name.trim();

    if (!nextName) {
      return;
    }

    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (!item.result) {
          return { ...item, name: nextName };
        }

        const outputName = createOutputFilename({
          originalName: nextName,
          format: getResultFormat(item.result),
          width: item.result.width ?? item.metadata?.width,
          height: item.result.height ?? item.metadata?.height,
          template: state.filenameTemplate,
        });

        return {
          ...item,
          name: nextName,
          result: {
            ...item.result,
            outputName,
          },
        };
      }),
    }));
  },
  renameFolderGroup: (folderKey, name) => {
    const nextName = name.trim();

    if (!nextName) {
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        getMediaFolderKey(item.file) === folderKey ? { ...item, file: renameMediaFolder(item.file, folderKey, nextName) } : item,
      ),
    }));
  },
  reorderItems: (sourceId, targetId, placement) =>
    set((state) => ({
      items: reorderItemsById(state.items, sourceId, targetId, placement),
    })),
  reorderGroups: (sourceGroupKey, targetGroupKey, placement) =>
    set((state) => ({
      items: reorderGroupsByKey(
        state.items,
        sourceGroupKey,
        targetGroupKey,
        (item) => getMediaFolderKey(item.file) ?? LOOSE_MEDIA_GROUP_KEY,
        placement,
      ),
    })),
  clearItems: () =>
    set((state) => {
      state.items.forEach(revokeMediaUrls);

      return { items: [], selectedId: undefined };
    }),
  selectItem: (id) => set({ selectedId: id }),
  updateStatus: (id, status, progress) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              progress: progress ?? item.progress,
              error: status === "processing" || status === "pending" ? undefined : item.error,
            }
          : item,
      ),
    })),
  updateProgress: (id, progress) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, progress } : item)),
    })),
  setResult: (id, result) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (item.result?.objectUrl) {
          URL.revokeObjectURL(item.result.objectUrl);
        }

        const normalizedResult = {
          ...result,
          size: result.blob.size,
        };

        return {
          ...item,
          result: normalizedResult,
          status: "completed",
          progress: 100,
          error: undefined,
        };
      }),
    })),
  setError: (id, error) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, error, status: "failed", progress: 0 } : item)),
    })),
  updateImageOptions: (options) =>
    set((state) => ({
      imageOptions: {
        ...state.imageOptions,
        ...options,
      },
    })),
  updateVideoOptions: (options) =>
    set((state) => ({
      videoOptions: {
        ...state.videoOptions,
        ...options,
      },
    })),
  updateFilenameTemplate: (template) => set({ filenameTemplate: template }),
  updateArchiveName: (name) => set({ archiveName: name }),
  renameResults: (ids) =>
    set((state) => {
      const selectedIds = new Set(ids);
      let resultIndex = 1;

      return {
        items: state.items.map((item) => {
          if (!selectedIds.has(item.id) || !item.result) {
            return item;
          }

          const outputName = createOutputFilename({
            originalName: item.name,
            format: getResultFormat(item.result),
            width: item.result.width ?? item.metadata?.width,
            height: item.result.height ?? item.metadata?.height,
            index: resultIndex,
            template: state.filenameTemplate,
          });

          resultIndex += 1;

          return {
            ...item,
            result: {
              ...item.result,
              outputName,
            },
          };
        }),
      };
    }),
}));

function revokeMediaUrls(item?: UploadedMedia) {
  if (!item) {
    return;
  }

  URL.revokeObjectURL(item.objectUrl);

  if (item.result?.objectUrl) {
    URL.revokeObjectURL(item.result.objectUrl);
  }
}

function getResultFormat(result: ProcessResult) {
  const outputExtension = result.outputName.split(".").pop();

  if (outputExtension) {
    return outputExtension.toLowerCase();
  }

  if (result.mimeType === "image/jpeg") {
    return "jpg";
  }

  return result.mimeType.split("/").pop()?.toLowerCase() || "converted";
}
