import { Maybe } from "@dolthub/web-utils";
import { Column } from "../columns/column.model";
import { DiffRowType } from "./rowDiff.enums";

export function canShowDroppedOrAddedRows(
  type: "added" | "dropped",
  filter: Maybe<DiffRowType>,
): boolean {
  if (filter === undefined || filter === null || filter === DiffRowType.All) {
    return true;
  }
  if (type === "added" && filter === DiffRowType.Added) return true;
  if (type === "dropped" && filter === DiffRowType.Removed) return true;
  return false;
}

export function unionCols(a: Column[], b: Column[]): Column[] {
  const mergedArray = [...a, ...b];
  const set = new Set();
  const unionArray = mergedArray.filter(item => {
    if (!set.has(item.name)) {
      set.add(item.name);
      return true;
    }
    return false;
  }, set);
  return unionArray;
}
