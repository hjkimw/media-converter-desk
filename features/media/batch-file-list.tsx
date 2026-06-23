"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Download, Folder, GripVertical, Trash2 } from "lucide-react";
import type { UploadedMedia } from "@/types/media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getFileRelativePath } from "@/lib/media/archive";
import { groupMediaByFolder } from "@/lib/media/folders";
import { formatBytes } from "@/lib/media/format";
import { cn } from "@/lib/utils";

type BatchFileListProps = {
  items: UploadedMedia[];
  selectedId?: string;
  checkedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleChecked: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onReorder: (sourceId: string, targetId: string) => void;
  onDownload: (id: string) => void;
  onRemove: (id: string) => void;
  onRemoveFolder: (folderKey: string) => void;
};

export function BatchFileList({
  items,
  selectedId,
  checkedIds,
  onSelect,
  onToggleChecked,
  onToggleAll,
  onReorder,
  onDownload,
  onRemove,
  onRemoveFolder,
}: BatchFileListProps) {
  const [draggingId, setDraggingId] = useState<string>();
  const [collapsedGroupKeys, setCollapsedGroupKeys] = useState<Set<string>>(() => new Set());

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm leading-6 text-muted-foreground">
        업로드한 파일과 폴더 항목이 여기에 표시됩니다. 항목이 많아지면 이 영역에서 스크롤됩니다.
      </div>
    );
  }

  const selectedVisibleCount = items.filter((item) => checkedIds.has(item.id)).length;
  const allChecked = items.length > 0 && selectedVisibleCount === items.length;
  const groups = groupMediaByFolder(items);
  const shouldShowGroupHeaders = groups.length > 1 || groups.some((group) => group.isFolder);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2">
        <p className="truncate text-xs text-muted-foreground">{selectedVisibleCount}개 선택</p>
        <Button size="sm" variant="ghost" onClick={() => onToggleAll(!allChecked)}>
          {allChecked ? "선택 해제" : "전체 선택"}
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {groups.map((group) => (
          <section key={group.key} className="flex flex-col gap-2" data-testid={`media-group-${group.key}`}>
            {shouldShowGroupHeaders ? (
              <div className="flex items-center justify-between gap-2 rounded-sm border border-border bg-secondary/60 px-2 py-1.5">
                <div className="flex min-w-0 items-center gap-2">
                  {group.isFolder ? (
                    <>
                      <input
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = isGroupPartiallyChecked(group.items, checkedIds);
                          }
                        }}
                        aria-label={`${isGroupFullyChecked(group.items, checkedIds) ? "Deselect" : "Select"} folder ${group.label}`}
                        checked={isGroupFullyChecked(group.items, checkedIds)}
                        className="size-4 shrink-0 cursor-pointer rounded-sm border border-input accent-primary"
                        type="checkbox"
                        onChange={() => {
                          const shouldCheck = !isGroupFullyChecked(group.items, checkedIds);

                          group.items.forEach((item) => {
                            if (checkedIds.has(item.id) !== shouldCheck) {
                              onToggleChecked(item.id);
                            }
                          });
                        }}
                      />
                      <Button
                        aria-expanded={!collapsedGroupKeys.has(group.key)}
                        aria-label={`${collapsedGroupKeys.has(group.key) ? "Expand" : "Collapse"} folder ${group.label}`}
                        className="size-7 shrink-0"
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setCollapsedGroupKeys((current) => {
                            const next = new Set(current);

                            if (next.has(group.key)) {
                              next.delete(group.key);
                            } else {
                              next.add(group.key);
                            }

                            return next;
                          });
                        }}
                      >
                        {collapsedGroupKeys.has(group.key) ? (
                          <ChevronRight aria-hidden="true" className="size-4" />
                        ) : (
                          <ChevronDown aria-hidden="true" className="size-4" />
                        )}
                      </Button>
                    </>
                  ) : (
                    <Folder aria-hidden="true" className="size-4 shrink-0 text-primary" />
                  )}
                  <button
                    className="flex min-w-0 items-center gap-2 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
                    disabled={!group.isFolder}
                    type="button"
                    onClick={() => {
                      if (!group.isFolder) {
                        return;
                      }

                      setCollapsedGroupKeys((current) => {
                        const next = new Set(current);

                        if (next.has(group.key)) {
                          next.delete(group.key);
                        } else {
                          next.add(group.key);
                        }

                        return next;
                      });
                    }}
                  >
                    <p className="truncate text-xs font-semibold">{group.label}</p>
                  </button>
                  <Badge className="shrink-0" variant={group.isFolder ? "success" : "secondary"}>
                    {group.items.length}개 항목
                  </Badge>
                </div>
                {group.isFolder ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      aria-label={`Delete folder ${group.label}`}
                      className="h-7 px-2 text-xs"
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveFolder(group.key)}
                    >
                      <Trash2 data-icon="inline-start" />
                      삭제
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}
            {collapsedGroupKeys.has(group.key)
              ? null
              : group.items.map((item) => {
                  const relativePath = getFileRelativePath(item.file);
                  const isChecked = checkedIds.has(item.id);
                  const isBusy = item.status === "pending" || item.status === "processing";
                  const canDownload = Boolean(item.result) && !isBusy;

                  return (
                    <div
                      key={item.id}
                      data-testid={`media-row-${item.id}`}
                      onPointerEnter={() => {
                        if (draggingId && draggingId !== item.id) {
                          onReorder(draggingId, item.id);
                        }
                      }}
                      onPointerUp={() => setDraggingId(undefined)}
                      onPointerCancel={() => setDraggingId(undefined)}
                      className={cn(
                        "group relative grid w-full grid-cols-[28px_24px_minmax(0,1fr)_auto] items-start gap-2 rounded-md border border-border bg-background p-2 transition-colors hover:border-primary/70",
                        selectedId === item.id && "border-primary bg-secondary",
                        draggingId === item.id && "border-primary bg-primary/10",
                      )}
                    >
                      <input
                        aria-label={`Select ${item.name}`}
                        checked={isChecked}
                        className="mt-3 size-4 cursor-pointer rounded-sm border border-input accent-primary"
                        type="checkbox"
                        onChange={() => onToggleChecked(item.id)}
                      />
                      <button
                        aria-label={`Reorder ${item.name}`}
                        className="mt-2 flex size-6 cursor-grab items-center justify-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-primary active:cursor-grabbing"
                        type="button"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          setDraggingId(item.id);
                          event.currentTarget.setPointerCapture?.(event.pointerId);
                        }}
                        onPointerUp={() => setDraggingId(undefined)}
                        onPointerCancel={() => setDraggingId(undefined)}
                      >
                        <GripVertical aria-hidden="true" className="size-4" />
                      </button>
                      <button
                        aria-label={`Open ${item.name}`}
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className="flex min-w-0 items-start gap-3 rounded-sm p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <MediaThumbnail item={item} />
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate text-sm font-medium">{item.name}</p>
                          </div>
                          <div className="mt-1 flex min-w-0 items-center gap-2">
                            <p className="font-brand-mono shrink-0 text-xs text-muted-foreground">{formatBytes(item.size)}</p>
                            <MimePill item={item} />
                          </div>
                          {relativePath ? (
                            <p className="font-brand-mono mt-1 truncate text-[11px] text-muted-foreground">{relativePath}</p>
                          ) : null}
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={item.progress} />
                            <span className="font-brand-mono w-9 shrink-0 text-right text-[11px] text-muted-foreground">
                              {item.progress}%
                            </span>
                          </div>
                        </div>
                      </button>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          aria-label={`Download ${item.name}`}
                          disabled={!canDownload}
                          size="icon"
                          variant="ghost"
                          onClick={() => onDownload(item.id)}
                        >
                          <Download data-icon="inline-start" />
                        </Button>
                        <Button
                          aria-label={`Remove ${item.name}`}
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            onRemove(item.id);
                          }}
                        >
                          <Trash2 data-icon="inline-start" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
          </section>
        ))}
      </div>
    </div>
  );
}

function isGroupFullyChecked(items: UploadedMedia[], checkedIds: Set<string>) {
  return items.length > 0 && items.every((item) => checkedIds.has(item.id));
}

function isGroupPartiallyChecked(items: UploadedMedia[], checkedIds: Set<string>) {
  const checkedCount = items.filter((item) => checkedIds.has(item.id)).length;
  return checkedCount > 0 && checkedCount < items.length;
}

function MimePill({ item }: { item: UploadedMedia }) {
  return (
    <span
      data-testid={`mime-pill-${item.id}`}
      className={cn(
        "font-brand-mono min-w-0 truncate rounded-sm border px-1.5 py-0.5 text-[11px] leading-4",
        item.type === "image" && "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
        item.type === "video" && "border-amber-400/30 bg-amber-400/10 text-amber-200",
      )}
    >
      {item.mimeType || "unknown MIME"}
    </span>
  );
}

function MediaThumbnail({ item }: { item: UploadedMedia }) {
  const className = "mt-0.5 size-12 shrink-0 overflow-hidden rounded-sm border border-border bg-secondary object-cover";

  if (item.type === "video") {
    return (
      <video
        aria-label={`${item.name} preview`}
        className={className}
        muted
        playsInline
        preload="metadata"
        src={item.objectUrl}
      />
    );
  }

  return <img alt={`${item.name} preview`} className={className} src={item.objectUrl} />;
}
