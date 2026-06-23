"use client";

import { useState } from "react";
import { ArrowRight, ImageIcon, Maximize2, Minus, Plus, VideoIcon } from "lucide-react";
import type { UploadedMedia } from "@/types/media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBytes, formatPercentChange } from "@/lib/media/format";
import { buildPreviewMetadata, type PreviewMetadataRow } from "@/lib/media/preview-metadata";

type PreviewPanelProps = {
  item?: UploadedMedia;
  action?: React.ReactNode;
};

export function PreviewPanel({ item, action }: PreviewPanelProps) {
  const [zoom, setZoom] = useState(100);

  if (!item) {
    return (
      <section
        data-testid="empty-preview-panel"
        className="relative flex h-[min(58svh,520px)] min-h-[360px] flex-none items-center justify-center overflow-y-auto rounded-md border border-border bg-card p-4 xl:h-auto xl:min-h-0 xl:flex-1 xl:overflow-hidden"
      >
        {action ? <div className="absolute right-4 top-4 z-10">{action}</div> : null}
        <div className="m-auto flex max-w-md flex-col items-center gap-5 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-sm border border-border bg-secondary text-primary">
            <ImageIcon aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold leading-8">Queue media to begin</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              이미지 또는 짧은 영상을 추가하면 원본과 변환 결과를 같은 캔버스에서 비교합니다.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const metadata = buildPreviewMetadata(item);
  const zoomOut = () => setZoom((current) => Math.max(50, current - 10));
  const zoomIn = () => setZoom((current) => Math.min(200, current + 10));
  const fitPreview = () => setZoom(100);

  return (
    <section
      data-testid="preview-panel"
      className="flex h-[min(54svh,520px)] min-h-[320px] flex-none flex-col overflow-hidden rounded-md border border-border bg-card xl:h-auto xl:min-h-0 xl:flex-1"
    >
      <div className="flex shrink-0 flex-col gap-2 border-b border-border p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-6">Preview canvas</h2>
          <p className="truncate text-sm leading-5 text-muted-foreground">{item.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={item.type === "image" ? "success" : "secondary"}>{item.type.toUpperCase()}</Badge>
          <Badge variant="muted">{item.status}</Badge>
          <Badge variant="muted">{formatBytes(item.size)}</Badge>
          {item.result ? <Badge variant="secondary">{formatPercentChange(item.size, item.result.size)}</Badge> : null}
          <PreviewZoomControls zoom={zoom} onFit={fitPreview} onZoomIn={zoomIn} onZoomOut={zoomOut} />
          {action}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto xl:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] xl:overflow-hidden">
        <PreviewPane title="Original" description={item.mimeType || "Unknown MIME"}>
          <MediaPreview item={item} src={item.objectUrl} zoom={zoom} />
          <PreviewMetadata title="Before metadata" rows={metadata.before} />
        </PreviewPane>

        <div className="flex items-center justify-center border-y border-border bg-secondary/50 py-1 xl:border-x xl:border-y-0 xl:px-2 xl:py-0">
          <div className="flex size-7 items-center justify-center rounded-sm border border-border bg-background text-primary">
            <ArrowRight aria-hidden="true" />
          </div>
        </div>

        <PreviewPane
          title="Result"
          description={item.result ? "Converted output" : "Run conversion to preview output"}
        >
          {item.result ? (
            <>
              <MediaPreview item={item} src={item.result.objectUrl} resultMimeType={item.result.mimeType} zoom={zoom} />
              <PreviewMetadata title="After metadata" rows={metadata.after} />
            </>
          ) : (
            <>
              <div className="flex min-h-0 flex-1 items-center justify-center rounded-md border border-dashed hairline-dashed bg-secondary/40 p-4 text-center text-sm text-muted-foreground">
                변환 결과 대기 중
              </div>
              <PreviewMetadata title="After metadata" rows={metadata.after} />
            </>
          )}
        </PreviewPane>
      </div>
    </section>
  );
}

function PreviewZoomControls({
  zoom,
  onFit,
  onZoomIn,
  onZoomOut,
}: {
  zoom: number;
  onFit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div className="flex h-8 items-center rounded-sm border border-border bg-secondary">
      <Button aria-label="Fit preview" className="h-7 px-2" size="sm" variant="ghost" onClick={onFit}>
        <Maximize2 data-icon="inline-start" />
        Fit
      </Button>
      <div className="h-5 w-px bg-border" />
      <Button aria-label="Zoom out" className="size-7 px-0" disabled={zoom <= 50} size="icon" variant="ghost" onClick={onZoomOut}>
        <Minus data-icon="inline-start" />
      </Button>
      <span className="font-brand-mono w-12 text-center text-xs leading-5 text-muted-foreground">{zoom}%</span>
      <Button aria-label="Zoom in" className="size-7 px-0" disabled={zoom >= 200} size="icon" variant="ghost" onClick={onZoomIn}>
        <Plus data-icon="inline-start" />
      </Button>
    </div>
  );
}

function PreviewPane({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-testid={`preview-pane-${title.toLowerCase()}`}
      className="flex shrink-0 flex-col gap-2 p-2 sm:gap-3 sm:p-3 xl:min-h-0 xl:shrink xl:flex-1 xl:overflow-hidden"
    >
      <div className="min-w-0 shrink-0">
        <h3 className="text-sm font-semibold leading-5">{title}</h3>
        <p className="truncate text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <div
        data-testid={`preview-pane-body-${title.toLowerCase()}`}
        className="flex min-h-0 flex-1 flex-col gap-3 xl:overflow-y-auto"
      >
        {children}
      </div>
    </div>
  );
}

function MediaPreview({
  item,
  src,
  resultMimeType,
  zoom,
}: {
  item: UploadedMedia;
  src: string;
  resultMimeType?: string;
  zoom: number;
}) {
  const mediaStyle = {
    transform: `scale(${zoom / 100})`,
  };

  if (item.type === "image" || resultMimeType?.startsWith("image/")) {
    return (
      <div
        data-testid="media-preview-frame"
        className="flex h-[220px] shrink-0 overflow-auto rounded-md bg-secondary xl:min-h-[160px] xl:flex-1"
      >
        <img
          alt={item.name}
          className="m-auto h-full w-full origin-center rounded-md object-contain transition-transform duration-150"
          src={src}
          style={mediaStyle}
        />
      </div>
    );
  }

  return (
    <div
      data-testid="media-preview-frame"
      className="flex h-[220px] shrink-0 overflow-auto rounded-md bg-secondary xl:min-h-[160px] xl:flex-1"
    >
      <video
        className="m-auto h-full w-full origin-center rounded-md object-contain transition-transform duration-150"
        controls
        muted
        playsInline
        src={src}
        style={mediaStyle}
      >
        <VideoIcon aria-hidden="true" />
      </video>
    </div>
  );
}

function PreviewMetadata({ title, rows }: { title: string; rows: PreviewMetadataRow[] }) {
  return (
    <div className="shrink-0 rounded-md border border-border bg-background p-2">
      <h4 className="mb-2 text-xs font-semibold leading-4 text-muted-foreground">{title}</h4>
      <dl className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={`${title}-${row.label}`} className="min-w-0 rounded-sm bg-secondary px-2 py-1.5">
            <dt className="text-[11px] leading-4 text-muted-foreground">{row.label}</dt>
            <dd className="font-brand-mono truncate text-xs leading-4 text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
