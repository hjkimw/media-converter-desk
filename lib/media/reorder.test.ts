import { describe, expect, it } from "vitest";
import { getArchiveFilename } from "./archive";
import { reorderById, reorderGroupsByKey } from "./reorder";

describe("reorderById", () => {
  it("moves the source item before the target item", () => {
    expect(reorderById(["a", "b", "c"], "c", "a")).toEqual(["c", "a", "b"]);
    expect(reorderById(["a", "b", "c"], "a", "c")).toEqual(["b", "a", "c"]);
  });

  it("moves the source item after the target item when requested", () => {
    expect(reorderById(["a", "b", "c"], "a", "c", "after")).toEqual(["b", "c", "a"]);
    expect(reorderById(["a", "b", "c"], "c", "a", "after")).toEqual(["a", "c", "b"]);
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

  it("moves a whole folder group before the target group while preserving item order", () => {
    expect(reorderGroupsByKey(items, "folder:Work", "folder:Trip").map((item) => item.id)).toEqual([
      "c",
      "d",
      "a",
      "b",
      "e",
    ]);
  });

  it("moves a whole folder group after the target group when requested", () => {
    expect(reorderGroupsByKey(items, "folder:Trip", "folder:Work", (item) => item.folderKey, "after").map((item) => item.id)).toEqual([
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
