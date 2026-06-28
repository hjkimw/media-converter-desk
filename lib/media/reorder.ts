export type ReorderPlacement = "before" | "after";

export function reorderById(ids: string[], sourceId: string, targetId: string, placement: ReorderPlacement = "before") {
  const sourceIndex = ids.indexOf(sourceId);
  const targetIndex = ids.indexOf(targetId);

  if (sourceIndex === -1 || targetIndex === -1 || sourceId === targetId) {
    return ids;
  }

  const next = [...ids];
  const [source] = next.splice(sourceIndex, 1);
  const nextTargetIndex = next.indexOf(targetId);

  next.splice(placement === "after" ? nextTargetIndex + 1 : nextTargetIndex, 0, source);

  return next;
}

export function reorderItemsById<T extends { id: string }>(
  items: T[],
  sourceId: string,
  targetId: string,
  placement: ReorderPlacement = "before",
) {
  const reorderedIds = reorderById(
    items.map((item) => item.id),
    sourceId,
    targetId,
    placement,
  );
  const itemById = new Map(items.map((item) => [item.id, item]));

  return reorderedIds.map((id) => itemById.get(id)).filter(Boolean) as T[];
}

export function reorderGroupsByKey<T>(
  items: T[],
  sourceGroupKey: string,
  targetGroupKey: string,
  getGroupKey: (item: T) => string | undefined = (item) => (item as { folderKey?: string }).folderKey,
  placement: ReorderPlacement = "before",
) {
  if (sourceGroupKey === targetGroupKey) {
    return items;
  }

  const groups: Array<{ key: string | undefined; items: T[] }> = [];
  const groupIndexes = new Map<string | undefined, number>();

  items.forEach((item) => {
    const key = getGroupKey(item);
    const index = groupIndexes.get(key);

    if (index !== undefined) {
      groups[index].items.push(item);
      return;
    }

    groupIndexes.set(key, groups.length);
    groups.push({ key, items: [item] });
  });

  const sourceIndex = groups.findIndex((group) => group.key === sourceGroupKey);
  const targetIndex = groups.findIndex((group) => group.key === targetGroupKey);

  if (sourceIndex === -1 || targetIndex === -1) {
    return items;
  }

  const nextGroups = [...groups];
  const [sourceGroup] = nextGroups.splice(sourceIndex, 1);
  const nextTargetIndex = nextGroups.findIndex((group) => group.key === targetGroupKey);
  nextGroups.splice(placement === "after" ? nextTargetIndex + 1 : nextTargetIndex, 0, sourceGroup);

  return nextGroups.flatMap((group) => group.items);
}
