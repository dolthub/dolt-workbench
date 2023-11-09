import { registerEnumType } from "@nestjs/graphql";

export enum DiffRowType {
  Added,
  Removed,
  Modified,
  All,
}

registerEnumType(DiffRowType, { name: "DiffRowType" });

export function convertToStringForQuery(t?: DiffRowType): string | undefined {
  if (t === undefined) return undefined;
  switch (t) {
    case DiffRowType.Added:
      return "added";
    case DiffRowType.Modified:
      return "modified";
    case DiffRowType.Removed:
      return "removed";
    default:
      return undefined;
  }
}
