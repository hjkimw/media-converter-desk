import { describe, expect, it } from "vitest";
import { getArchiveFilename } from "./archive";
import { reorderById, reorderGroupsByKey } from "./reorder";

describe("reorderById", () => {
  it("moves an item up (before the target) when dragging upward", () => {
    expect(reorderById(["a", "b", "c"], "c", "a")).toEqual(["c", "a", "b"]);
    expect(reorderById(["a", "b", "c"], "b", "a")).toEqual(["b", "a", "c"]);
  });

  it("moves an item down (after the target) when dragging downward", () => {
    expect(reorderById(["a", "b", "c"], "a", "b")).toEqual(["b", "a", "c"]);
    expect(reorderById(["a", "b", "c"], "a", "c")).toEqual(["b", "c", "a"]);
  });

  it("keeps the original order for invalid or redundant moves", () => {
    expect(reorderById(["a", "b", "c"], "a", "a")).toEqual(["a", "b", "c"]);
    expect(reorderById(["a", "b", "c"], "x", "a")).toEqual(["a", "b", "c"]);
    expect(reorderById(["a", "b", "c"], "a", "x")).toEqual(["a", "b", "c"]);
  });
});

describe("reorderGroupsByKey", () => {
  const items = [
    createItem("a", "folder:Trip"),
    createItem("b", "folder:Trip"),
    createItem("c", "folder:Work"),
    createItem("d", "folder:Work"),
    createItem("e", undefined),
  ];

  it("moves a folder group up (before target) when dragging upward", () => {
    expect(reorderGroupsByKey(items, "folder:Work", "folder:Trip").map((item) => item.id)).toEqual([
      "c",
      "d",
      "a",
      "b",
      "e",
    ]);
  });

  it("moves a folder group down (after target) when dragging downward", () => {
    expect(reorderGroupsByKey(items, "folder:Trip", "folder:Work").map((item) => item.id)).toEqual([
      "c",
      "d",
      "a",
      "b",
      "e",
    ]);
  });

  it("keeps order for redundant or missing group moves", () => {
    expect(reorderGroupsByKey(items, "folder:Trip", "folder:Trip")).toEqual(items);
    expect(reorderGroupsByKey(items, "missing", "folder:Trip")).toEqual(items);
    expect(reorderGroupsByKey(items, "folder:Trip", "missing")).toEqual(items);
  });
});

describe("getArchiveFilename", () => {
  it("sanitizes custom archive names and appends zip once", () => {
    expect(getArchiveFilename("campaign export")).toBe("campaign export.zip");
    expect(getArchiveFilename("bad/name?.zip")).toBe("bad-name.zip");
  });

  it("falls back to the default archive name for empty input", () => {
    expect(getArchiveFilename("   ")).toBe("converted-media-results.zip");
  });
});

function createItem(id: string, folderKey: string | undefined) {
  return {
    id,
    folderKey,
  };
}
