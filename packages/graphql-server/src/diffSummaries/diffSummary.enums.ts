import { registerEnumType } from "@nestjs/graphql";

export enum TableDiffType {
  Added,
  Dropped,
  Modified,
  Renamed,
}

registerEnumType(TableDiffType, { name: "TableDiffType" });

export function toTableDiffType(t: string): TableDiffType {
  switch (t) {
    case "added":
      return TableDiffType.Added;
    case "dropped":
      return TableDiffType.Dropped;
    case "modified":
      return TableDiffType.Modified;
    case "renamed":
      return TableDiffType.Renamed;
    default:
      throw new Error(`Unknown table diff type: ${t}`);
  }
}

export enum CommitDiffType {
  TwoDot,
  ThreeDot,
  Unspecified,
}

registerEnumType(CommitDiffType, { name: "CommitDiffType" });
