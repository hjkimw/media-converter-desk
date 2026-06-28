import { getFileRelativePath } from "@/lib/media/archive";

export const LOOSE_MEDIA_GROUP_KEY = "__loose_media__";
export const LOOSE_MEDIA_GROUP_LABEL = "개별 파일";

const FOLDER_UPLOAD_ID_PROPERTY = "__mediaFolderUploadId";
const FOLDER_UPLOAD_LABEL_PROPERTY = "__mediaFolderUploadLabel";
let folderUploadSequence = 0;

export type MediaFolderGroup<T> = {
  key: string;
  label: string;
  isFolder: boolean;
  items: T[];
};

export function getMediaFolderKey(file: File) {
  const uploadId = getFolderUploadId(file);

  if (uploadId) {
    return uploadId;
  }

  const relativePath = getFileRelativePath(file);

  if (!relativePath) {
    return undefined;
  }

  return relativePath.split(/[\\/]/).filter(Boolean)[0];
}

export function getMediaFolderLabel(file: File) {
  return getFolderUploadLabel(file) ?? getMediaFolderKeyFromRelativePath(file);
}

export function groupMediaByFolder<T extends { file: File }>(items: T[]) {
  const groups: MediaFolderGroup<T>[] = [];
  const groupIndexes = new Map<string, number>();

  items.forEach((item) => {
    const folderKey = getMediaFolderKey(item.file);
    const key = folderKey ?? LOOSE_MEDIA_GROUP_KEY;
    const label = getMediaFolderLabel(item.file);
    const index = groupIndexes.get(key);

    if (index !== undefined) {
      groups[index].items.push(item);
      return;
    }

    groupIndexes.set(key, groups.length);
    groups.push({
      key,
      label: label ?? LOOSE_MEDIA_GROUP_LABEL,
      isFolder: Boolean(folderKey),
      items: [item],
    });
  });

  return groups;
}

export function markFolderSelectionFiles(files: File[]) {
  const folderGroups = new Map<string, File[]>();

  files.forEach((file) => {
    const folderName = getMediaFolderKeyFromRelativePath(file);

    if (!folderName) {
      return;
    }

    folderGroups.set(folderName, [...(folderGroups.get(folderName) ?? []), file]);
  });

  folderGroups.forEach((groupFiles, folderName) => {
    markFilesAsFolderUpload(groupFiles, { label: folderName });
  });

  return files;
}

export function markFilesAsFolderUpload(files: File[], identity: { id?: string; label: string }) {
  const id = identity.id ?? createFolderUploadId(identity.label);

  files.forEach((file) => {
    defineFileMetadata(file, FOLDER_UPLOAD_ID_PROPERTY, id);
    defineFileMetadata(file, FOLDER_UPLOAD_LABEL_PROPERTY, identity.label);
  });

  return files;
}

export function renameMediaFolder(file: File, sourceGroupKey: string, label: string) {
  const nextLabel = sanitizeFolderLabel(label);

  if (!nextLabel || getMediaFolderKey(file) !== sourceGroupKey) {
    return file;
  }

  defineFileMetadata(file, FOLDER_UPLOAD_LABEL_PROPERTY, nextLabel);

  const relativePath = getFileRelativePath(file);

  if (relativePath) {
    const pathParts = relativePath.split(/[\\/]/).filter(Boolean);
    const filenameParts = pathParts.length > 1 ? pathParts.slice(1) : [file.name];

    defineFileMetadata(file, "webkitRelativePath", [nextLabel, ...filenameParts].join("/"));
  }

  return file;
}

function getMediaFolderKeyFromRelativePath(file: File) {
  const relativePath = getFileRelativePath(file);

  if (!relativePath) {
    return undefined;
  }

  return relativePath.split(/[\\/]/).filter(Boolean)[0];
}

function getFolderUploadId(file: File) {
  return (file as File & Record<string, string | undefined>)[FOLDER_UPLOAD_ID_PROPERTY];
}

function getFolderUploadLabel(file: File) {
  return (file as File & Record<string, string | undefined>)[FOLDER_UPLOAD_LABEL_PROPERTY];
}

function createFolderUploadId(label: string) {
  folderUploadSequence += 1;
  const randomId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${folderUploadSequence}`;

  return `folder:${label}:${randomId}`;
}

function defineFileMetadata(file: File, property: string, value: string) {
  try {
    Object.defineProperty(file, property, {
      configurable: true,
      value,
    });
  } catch {
    // Some browser File implementations are non-extensible; relative paths still provide a fallback group.
  }
}

function sanitizeFolderLabel(label: string) {
  return label
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-")
    .replace(/^[.\-\s]+|[.\-\s]+$/g, "");
}
