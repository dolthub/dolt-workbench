import { DiffRowType } from "../rowDiffs/rowDiff.enums";

export type DBArgs = { databaseName: string };
export type SchemaArgs = { schemaName: string };
export type RefArgs = DBArgs & { refName: string };
export type BranchArgs = DBArgs & { branchName: string };
export type TagArgs = DBArgs & { tagName: string };
export type TableArgs = RefArgs & { tableName: string };

export type BranchesArgs = DBArgs & {
  fromBranchName: string;
  toBranchName: string;
  refName?: string;
};
export type RefsArgs = DBArgs & {
  fromRefName: string;
  toRefName: string;
  refName?: string;
};
export type RefsMaybeTableArgs = RefsArgs & { tableName?: string };
export type RefsTableArgs = RefsArgs & { tableName: string };
export type RowDiffArgs = DBArgs & {
  refName?: string;
  tableName: string;
  fromTableName: string;
  toTableName: string;
  fromCommitId: string;
  toCommitId: string;
  offset: number;
  filterByRowType?: DiffRowType;
};

export type RawRow = Record<string, any>;
export type RawRows = RawRow[];
export type PR = Promise<RawRows>;
export type SPR = Promise<RawRow>;
export type UPR = Promise<RawRows | undefined>;
export type Params = Array<string | number | undefined> | undefined;
export type ParQuery = (q: string, p?: Params) => PR;

export type TableRowPagination = { pkCols: string[]; offset: number };
export type DiffRes = Promise<{ colsUnion: RawRows; diff: RawRows }>;
export type CommitsRes = Promise<{ fromCommitId: string; toCommitId: string }>;
export type CommitAuthor = { name: string; email: string };
