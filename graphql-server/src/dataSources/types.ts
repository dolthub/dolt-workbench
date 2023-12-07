export type DBArgs = { databaseName: string };
export type RefArgs = DBArgs & { refName: string };
export type BranchArgs = DBArgs & { branchName: string };
export type TagArgs = DBArgs & { tagName: string };
export type TableArgs = RefArgs & { tableName: string };
// export type TableRevArgs = DBArgs & {
//   revisionName: string;
//   tableName: string;
//   refName?: string;
// };
// export type DiffArgs = DBArgs & { fromCommitId: string; toCommitId: string };
// export type TableDiffArgs = DiffArgs & { tableName: string; refName?: string };
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

export type RawRow = Record<string, any>;
export type RawRows = RawRow[];
export type PR = Promise<RawRows>;
export type IsDoltRes = Promise<{ res: RawRows; isDolt: boolean }>;
export type UPR = Promise<RawRows | undefined>;

export type TableRowPagination = { columns: RawRow[]; offset: number };
// export type QueryFunc = (s: string) => PR;
// export type ParQuery = (q: string, p?: ObjectLiteral) => PR;
// export type CommitAuthor = { name: string; email: string };
