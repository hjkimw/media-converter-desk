import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BatchFileList } from "./batch-file-list";
import type { UploadedMedia } from "@/types/media";

describe("BatchFileList", () => {
  it("separates row selection from checkbox selection", () => {
    const onSelect = vi.fn();
    const onToggleChecked = vi.fn();

    render(
      <BatchFileList
        checkedIds={new Set()}
        items={[createItem("a", "sample.png")]}
        onDownload={vi.fn()}
        onRemove={vi.fn()}
        onRemoveFolder={vi.fn()}
        onReorder={vi.fn()}
        onSelect={onSelect}
        onToggleAll={vi.fn()}
        onToggleChecked={onToggleChecked}
        selectedId="a"
      />,
    );

    fireEvent.click(screen.getByLabelText("Select sample.png"));
    expect(onToggleChecked).toHaveBeenCalledWith("a");
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Open sample.png/ }));
    expect(onSelect).toHaveBeenCalledWith("a");
  });

  it("renders all selection control and only enables row download after conversion", () => {
    const onToggleAll = vi.fn();
    const onDownload = vi.fn();

    render(
      <BatchFileList
        checkedIds={new Set(["a", "b"])}
        items={[createItem("a", "sample.png"), createItem("b", "ready.png", 100, true)]}
        onDownload={onDownload}
        onRemove={vi.fn()}
        onRemoveFolder={vi.fn()}
        onReorder={vi.fn()}
        onSelect={vi.fn()}
        onToggleAll={onToggleAll}
        onToggleChecked={vi.fn()}
        selectedId="a"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "선택 해제" }));
    expect(onToggleAll).toHaveBeenCalledWith(false);

    expect(screen.getByLabelText("Download sample.png")).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Download sample.png"));
    expect(onDownload).not.toHaveBeenCalledWith("a");

    expect(screen.getByLabelText("Download ready.png")).toBeEnabled();
    fireEvent.click(screen.getByLabelText("Download ready.png"));
    expect(onDownload).toHaveBeenCalledWith("b");
  });

  it("does not expose a converted item as a conversion status label", () => {
    render(
      <BatchFileList
        checkedIds={new Set()}
        items={[createItem("a", "sample.png", 42)]}
        onDownload={vi.fn()}
        onRemove={vi.fn()}
        onRemoveFolder={vi.fn()}
        onReorder={vi.fn()}
        onSelect={vi.fn()}
        onToggleAll={vi.fn()}
        onToggleChecked={vi.fn()}
        selectedId="a"
      />,
    );

    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.queryByText("IDLE")).not.toBeInTheDocument();
    expect(screen.queryByText("idle")).not.toBeInTheDocument();
  });

  it("calls row download only for converted items", () => {
    const onDownload = vi.fn();

    render(
      <BatchFileList
        checkedIds={new Set()}
        items={[createItem("a", "sample.png", 100, true)]}
        onDownload={onDownload}
        onRemove={vi.fn()}
        onRemoveFolder={vi.fn()}
        onReorder={vi.fn()}
        onSelect={vi.fn()}
        onToggleAll={vi.fn()}
        onToggleChecked={vi.fn()}
        selectedId="a"
      />,
    );

    fireEvent.click(screen.getByLabelText("Download sample.png"));
    expect(onDownload).toHaveBeenCalledWith("a");
  });

  it("renders drag handles and reports pointer-based reorder requests", () => {
    const onReorder = vi.fn();

    render(
      <BatchFileList
        checkedIds={new Set()}
        items={[createItem("a", "first.png"), createItem("b", "second.png")]}
        onDownload={vi.fn()}
        onRemove={vi.fn()}
        onRemoveFolder={vi.fn()}
        onReorder={onReorder}
        onSelect={vi.fn()}
        onToggleAll={vi.fn()}
        onToggleChecked={vi.fn()}
        selectedId="a"
      />,
    );

    const handle = screen.getByLabelText("Reorder first.png");
    const targetRow = screen.getByTestId("media-row-b");
    document.elementFromPoint = vi.fn().mockReturnValue(targetRow);

    fireEvent.pointerDown(handle);
    fireEvent.pointerMove(handle, { clientX: 0, clientY: 100 });
    fireEvent.pointerUp(handle);

    expect(onReorder).toHaveBeenCalledWith("a", "b");
  });

  it("groups folder uploads and exposes a folder delete action", () => {
    const onRemoveFolder = vi.fn();

    render(
      <BatchFileList
        checkedIds={new Set()}
        items={[
          createItem("a", "photo.png", 0, false, "Trip/photo.png"),
          createItem("b", "clip.mp4", 0, false, "Trip/clip.mp4", "video"),
          createItem("c", "loose.png"),
        ]}
        onDownload={vi.fn()}
        onRemove={vi.fn()}
        onRemoveFolder={onRemoveFolder}
        onReorder={vi.fn()}
        onSelect={vi.fn()}
        onToggleAll={vi.fn()}
        onToggleChecked={vi.fn()}
        selectedId="a"
      />,
    );

    expect(screen.getByText("Trip")).toBeInTheDocument();
    expect(screen.getByText("2개 항목")).toBeInTheDocument();
    expect(screen.getByText("개별 파일")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Collapse folder Trip" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete folder Trip" }));
    expect(onRemoveFolder).toHaveBeenCalledWith("Trip");
  });

  it("keeps a collapsed folder group checkbox stable with custom mixed state", () => {
    render(
      <BatchFileList
        checkedIds={new Set(["a"])}
        items={[
          createItem("a", "photo.png", 0, false, "Trip/photo.png"),
          createItem("b", "clip.mp4", 0, false, "Trip/clip.mp4", "video"),
        ]}
        onDownload={vi.fn()}
        onRemove={vi.fn()}
        onRemoveFolder={vi.fn()}
        onReorder={vi.fn()}
        onSelect={vi.fn()}
        onToggleAll={vi.fn()}
        onToggleChecked={vi.fn()}
        selectedId="a"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse folder Trip" }));

    const checkbox = screen.getByRole("checkbox", { name: "Select folder Trip" });
    expect(checkbox.tagName).toBe("BUTTON");
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");
    expect(checkbox).toHaveClass("size-4");
    expect(screen.getByTestId("folder-checkbox-icon-Trip")).toHaveAttribute("data-state", "mixed");
  });

  it("renders folder drag handles and reports group reorder requests", () => {
    const onReorderGroup = vi.fn();

    render(
      <BatchFileList
        checkedIds={new Set()}
        items={[
          createItem("a", "photo.png", 0, false, "Trip/photo.png"),
          createItem("b", "clip.mp4", 0, false, "Trip/clip.mp4", "video"),
          createItem("c", "work.png", 0, false, "Work/work.png"),
        ]}
        onDownload={vi.fn()}
        onRemove={vi.fn()}
        onRemoveFolder={vi.fn()}
        onReorder={vi.fn()}
        onReorderGroup={onReorderGroup}
        onSelect={vi.fn()}
        onToggleAll={vi.fn()}
        onToggleChecked={vi.fn()}
        selectedId="a"
      />,
    );

    const handle = screen.getByLabelText("Reorder folder Trip");
    const targetSection = screen.getByTestId("media-group-Work");
    document.elementFromPoint = vi.fn().mockReturnValue(targetSection);

    fireEvent.pointerDown(handle);
    fireEvent.pointerMove(handle, { clientX: 0, clientY: 200 });
    fireEvent.pointerUp(handle);

    expect(onReorderGroup).toHaveBeenCalledWith("Trip", "Work");
  });

  it("collapses and expands folder-uploaded groups without deleting items", () => {
    render(
      <BatchFileList
        checkedIds={new Set()}
        items={[
          createItem("a", "photo.png", 0, false, "Trip/photo.png"),
          createItem("b", "clip.mp4", 0, false, "Trip/clip.mp4", "video"),
        ]}
        onDownload={vi.fn()}
        onRemove={vi.fn()}
        onRemoveFolder={vi.fn()}
        onReorder={vi.fn()}
        onSelect={vi.fn()}
        onToggleAll={vi.fn()}
        onToggleChecked={vi.fn()}
        selectedId="a"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse folder Trip" }));
    expect(screen.queryByTestId("media-row-a")).not.toBeInTheDocument();
    expect(screen.queryByTestId("media-row-b")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Expand folder Trip" }));
    expect(screen.getByTestId("media-row-a")).toBeInTheDocument();
    expect(screen.getByTestId("media-row-b")).toBeInTheDocument();
  });

  it("selects only the items inside a folder group", () => {
    const onToggleChecked = vi.fn();

    render(
      <BatchFileList
        checkedIds={new Set()}
        items={[
          createItem("a", "photo.png", 0, false, "Trip/photo.png"),
          createItem("b", "clip.mp4", 0, false, "Trip/clip.mp4", "video"),
          createItem("c", "loose.png"),
        ]}
        onDownload={vi.fn()}
        onRemove={vi.fn()}
        onRemoveFolder={vi.fn()}
        onReorder={vi.fn()}
        onSelect={vi.fn()}
        onToggleAll={vi.fn()}
        onToggleChecked={onToggleChecked}
        selectedId="a"
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Select folder Trip" }));

    expect(onToggleChecked).toHaveBeenCalledTimes(2);
    expect(onToggleChecked).toHaveBeenCalledWith("a");
    expect(onToggleChecked).toHaveBeenCalledWith("b");
    expect(onToggleChecked).not.toHaveBeenCalledWith("c");
  });

  it("deselects only the items inside a fully selected folder group", () => {
    const onToggleChecked = vi.fn();

    render(
      <BatchFileList
        checkedIds={new Set(["a", "b"])}
        items={[
          createItem("a", "photo.png", 0, false, "Trip/photo.png"),
          createItem("b", "clip.mp4", 0, false, "Trip/clip.mp4", "video"),
          createItem("c", "loose.png"),
        ]}
        onDownload={vi.fn()}
        onRemove={vi.fn()}
        onRemoveFolder={vi.fn()}
        onReorder={vi.fn()}
        onSelect={vi.fn()}
        onToggleAll={vi.fn()}
        onToggleChecked={onToggleChecked}
        selectedId="a"
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Deselect folder Trip" }));

    expect(onToggleChecked).toHaveBeenCalledTimes(2);
    expect(onToggleChecked).toHaveBeenCalledWith("a");
    expect(onToggleChecked).toHaveBeenCalledWith("b");
    expect(onToggleChecked).not.toHaveBeenCalledWith("c");
  });

  it("shows indeterminate state when only some items in a folder are checked", () => {
    render(
      <BatchFileList
        checkedIds={new Set(["a"])}
        items={[
          createItem("a", "photo.png", 0, false, "Trip/photo.png"),
          createItem("b", "clip.mp4", 0, false, "Trip/clip.mp4", "video"),
        ]}
        onDownload={vi.fn()}
        onRemove={vi.fn()}
        onRemoveFolder={vi.fn()}
        onReorder={vi.fn()}
        onSelect={vi.fn()}
        onToggleAll={vi.fn()}
        onToggleChecked={vi.fn()}
        selectedId="a"
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Select folder Trip" });
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");
    expect(screen.getByTestId("folder-checkbox-icon-Trip")).toHaveAttribute("data-state", "mixed");
  });

  it("checks all items when clicking an indeterminate group checkbox", () => {
    const onToggleChecked = vi.fn();

    render(
      <BatchFileList
        checkedIds={new Set(["a"])}
        items={[
          createItem("a", "photo.png", 0, false, "Trip/photo.png"),
          createItem("b", "clip.mp4", 0, false, "Trip/clip.mp4", "video"),
        ]}
        onDownload={vi.fn()}
        onRemove={vi.fn()}
        onRemoveFolder={vi.fn()}
        onReorder={vi.fn()}
        onSelect={vi.fn()}
        onToggleAll={vi.fn()}
        onToggleChecked={onToggleChecked}
        selectedId="a"
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Select folder Trip" }));

    expect(onToggleChecked).toHaveBeenCalledTimes(1);
    expect(onToggleChecked).toHaveBeenCalledWith("b");
  });

  it("renders source thumbnails and emphasizes MIME instead of a standalone media type tag", () => {
    render(
      <BatchFileList
        checkedIds={new Set()}
        items={[
          createItem("image", "photo.png", 0, false, undefined, "image", "blob:photo", "image/jpeg"),
          createItem("video", "clip.mp4", 0, false, undefined, "video", "blob:clip"),
        ]}
        onDownload={vi.fn()}
        onRemove={vi.fn()}
        onRemoveFolder={vi.fn()}
        onReorder={vi.fn()}
        onSelect={vi.fn()}
        onToggleAll={vi.fn()}
        onToggleChecked={vi.fn()}
        selectedId="image"
      />,
    );

    expect(screen.getByAltText("photo.png preview")).toHaveAttribute("src", "blob:photo");
    expect(screen.getByLabelText("clip.mp4 preview").tagName).toBe("VIDEO");
    expect(screen.queryByText("image")).not.toBeInTheDocument();
    expect(screen.getByTestId("mime-pill-image")).toHaveTextContent("image/jpeg");
  });
});

function createItem(
  id: string,
  name: string,
  progress = 0,
  withResult = false,
  relativePath?: string,
  type: "image" | "video" = "image",
  objectUrl = "blob:sample",
  mimeType = type === "image" ? "image/png" : "video/mp4",
) {
  const file = new File(["x"], name, { type: mimeType });

  if (relativePath) {
    Object.defineProperty(file, "webkitRelativePath", {
      configurable: true,
      value: relativePath,
    });
  }

  return {
    id,
    file,
    type,
    name,
    size: 1,
    mimeType,
    objectUrl,
    status: withResult ? "completed" : "idle",
    progress,
    result: withResult
      ? {
          blob: new Blob(["x"], { type: "image/webp" }),
          objectUrl: "blob:result",
          outputName: "ready.webp",
          size: 1,
          mimeType: "image/webp",
        }
      : undefined,
    warnings: [],
  } as UploadedMedia;
}
