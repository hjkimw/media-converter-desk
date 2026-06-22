"use client";

import { Link2, Unlink2 } from "lucide-react";
import type { VideoProcessOptions } from "@/types/media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

type VideoSettingsPanelProps = {
  options: VideoProcessOptions;
  onChange: (options: Partial<VideoProcessOptions>) => void;
};

export function VideoSettingsPanel({ options, onChange }: VideoSettingsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-md border border-border bg-background p-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Video output</h3>
          <Badge variant="secondary">FFmpeg.wasm</Badge>
        </div>
        <Field label="Format">
          <Select
            value={options.outputFormat}
            options={[
              { value: "mp4", label: "MP4" },
              { value: "webm", label: "WEBM" },
              { value: "mov", label: "MOV - server later", disabled: true },
              { value: "gif", label: "GIF - phase 4", disabled: true },
            ]}
            onChange={(event) => {
              const outputFormat = event.currentTarget.value as VideoProcessOptions["outputFormat"];
              onChange({
                outputFormat,
                videoCodec: outputFormat === "mp4" ? "h264" : options.videoCodec,
              });
            }}
          />
        </Field>
        <Field label="Video codec">
          <Select
            disabled={options.outputFormat === "mp4"}
            value={options.outputFormat === "mp4" ? "h264" : options.videoCodec}
            options={[
              { value: "h264", label: "H.264" },
              { value: "vp9", label: "VP9" },
            ]}
            onChange={(event) => onChange({ videoCodec: event.currentTarget.value as VideoProcessOptions["videoCodec"] })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bitrate kbps">
            <Input
              type="number"
              min={256}
              value={options.bitrateKbps ?? ""}
              onChange={(event) =>
                onChange({ bitrateKbps: event.currentTarget.value ? Number(event.currentTarget.value) : undefined })
              }
            />
          </Field>
          <Field label="CRF">
            <Input
              type="number"
              min={18}
              max={40}
              value={options.crf ?? ""}
              onChange={(event) => onChange({ crf: event.currentTarget.value ? Number(event.currentTarget.value) : undefined })}
            />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3 rounded-md border border-border bg-background p-3">
        <h3 className="text-sm font-semibold">Resize</h3>
        <Field label="Mode">
          <Select
            value={options.resize.mode}
            options={[
              { value: "original", label: "Original" },
              { value: "percent", label: "Percent" },
              { value: "dimensions", label: "Width / height" },
              { value: "preset", label: "Preset" },
            ]}
            onChange={(event) =>
              onChange({
                resize: {
                  ...options.resize,
                  mode: event.currentTarget.value as VideoProcessOptions["resize"]["mode"],
                },
              })
            }
          />
        </Field>
        {options.resize.mode === "percent" ? (
          <Field label="Percent">
            <Select
              value={String(options.resize.percent ?? 100)}
              options={[25, 50, 75, 100].map((value) => ({ value: String(value), label: `${value}%` }))}
              onChange={(event) =>
                onChange({
                  resize: {
                    ...options.resize,
                    percent: Number(event.currentTarget.value) as VideoProcessOptions["resize"]["percent"],
                  },
                })
              }
            />
          </Field>
        ) : null}
        {options.resize.mode === "preset" ? (
          <Field label="Preset">
            <Select
              value={options.resize.preset ?? "720p"}
              options={[
                { value: "1080p", label: "1080p" },
                { value: "720p", label: "720p" },
                { value: "480p", label: "480p" },
              ]}
              onChange={(event) =>
                onChange({
                  resize: {
                    ...options.resize,
                    preset: event.currentTarget.value as VideoProcessOptions["resize"]["preset"],
                  },
                })
              }
            />
          </Field>
        ) : null}
        {options.resize.mode === "dimensions" ? (
          <div className="grid grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] items-end gap-2">
            <Field label="Width">
              <Input
                type="number"
                min={1}
                value={options.resize.width ?? ""}
                onChange={(event) =>
                  onChange({
                    resize: {
                      ...options.resize,
                      width: event.currentTarget.value ? Number(event.currentTarget.value) : undefined,
                    },
                  })
                }
              />
            </Field>
            <Button
              aria-label="Toggle video aspect ratio link"
              aria-pressed={options.resize.maintainAspectRatio}
              className={cnAspectButton(options.resize.maintainAspectRatio)}
              size="icon"
              title={options.resize.maintainAspectRatio ? "비율 연결 해제" : "비율 연결"}
              type="button"
              variant="secondary"
              onClick={() =>
                onChange({
                  resize: {
                    ...options.resize,
                    maintainAspectRatio: !options.resize.maintainAspectRatio,
                  },
                })
              }
            >
              {options.resize.maintainAspectRatio ? <Link2 aria-hidden="true" /> : <Unlink2 aria-hidden="true" />}
            </Button>
            <Field label="Height">
              <Input
                type="number"
                min={1}
                value={options.resize.height ?? ""}
                onChange={(event) =>
                  onChange({
                    resize: {
                      ...options.resize,
                      height: event.currentTarget.value ? Number(event.currentTarget.value) : undefined,
                    },
                  })
                }
              />
            </Field>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted p-3">
          <Label>Maintain ratio</Label>
          <Switch
            aria-label="Maintain video aspect ratio"
            checked={options.resize.maintainAspectRatio}
            onCheckedChange={(checked) =>
              onChange({
                resize: {
                  ...options.resize,
                  maintainAspectRatio: checked,
                },
              })
            }
          />
        </div>
      </section>

    </div>
  );
}

function cnAspectButton(isLinked: boolean) {
  return [
    "h-10 w-10 transition-colors",
    isLinked ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground",
  ].join(" ");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
