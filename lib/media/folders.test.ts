import { describe, expect, it } from "vitest";
import { LOOSE_MEDIA_GROUP_KEY, groupMediaByFolder, getMediaFolderKey, markFilesAsFolderUpload } from "./folders";

describe("media folder helpers", () => {
  it("extracts the top-level uploaded folder from relative file paths", () => {
    expect(getMediaFolderKey(createFile("photo.png", "Trip/raw/photo.png"))).toBe("Trip");
    expect(getMediaFolderKey(createFile("loose.png"))).toBeUndefined();
  });

  it("groups folder-uploaded media while preserving queue order", () => {
    const tripA = { id: "trip-a", file: createFile("a.png", "Trip/a.png") };
    const loose = { id: "loose", file: createFile("loose.png") };
    const tripB = { id: "trip-b", file: createFile("b.png", "Trip/nested/b.png") };

    const groups = groupMediaByFolder([tripA, loose, tripB]);

    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ key: "Trip", label: "Trip", isFolder: true });
    expect(groups[0].items.map((item) => item.id)).toEqual(["trip-a", "trip-b"]);
    expect(groups[1]).toMatchObject({ key: LOOSE_MEDIA_GROUP_KEY, label: "개별 파일", isFolder: false });
    expect(groups[1].items.map((item) => item.id)).toEqual(["loose"]);
  });

  it("keeps separately uploaded folders independent even when their folder names match", () => {
    const firstUpload = markFilesAsFolderUpload([createFile("a.png", "Trip/a.png")], { id: "folder-1", label: "Trip" });
    const secondUpload = markFilesAsFolderUpload([createFile("b.png", "Trip/b.png")], { id: "folder-2", label: "Trip" });

    const groups = groupMediaByFolder([
      { id: "first", file: firstUpload[0] },
      { id: "second", file: secondUpload[0] },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups.map((group) => group.key)).toEqual(["folder-1", "folder-2"]);
    expect(groups.map((group) => group.label)).toEqual(["Trip", "Trip"]);
  });
});

function createFile(name: string, relativePath?: string) {
  const file = new File(["x"], name, { type: "image/png" });

  if (relativePath) {
    Object.defineProperty(file, "webkitRelativePath", {
      configurable: true,
      value: relativePath,
    });
  }

  return file;
}
