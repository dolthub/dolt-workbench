import { DataSource, QueryRunner } from "typeorm";
import { SortBranchesBy } from "../branches/branch.enum";
import { CommitDiffType } from "../diffSummaries/diffSummary.enums";
import { DiffRowType } from "../rowDiffs/rowDiff.enums";
import { SchemaType } from "../schemas/schema.enums";

export type DBArgs = { databaseName: string };
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

export type RawRow = Record<string, any>;
export type RawRows = RawRow[];
export type PR = Promise<RawRows>;
export type UPR = Promise<RawRows | undefined>;
export type ParQuery = (q: string, p?: any[] | undefined) => PR;

export type TableRowPagination = { columns: RawRow[]; offset: number };

export declare class QueryFactory {
  ds: DataSource | undefined;

  isDolt: boolean;

  constructor(ds: DataSource | undefined);

  // UTILS

  getDS(): DataSource;

  getQR(): QueryRunner;

  handleAsyncQuery(work: (qr: QueryRunner) => Promise<any>): Promise<any>;

  query(q: string, p: any[], dbName?: string, refName?: string): Promise<any>;

  queryMultiple(
    executeQuery: (pq: ParQuery) => Promise<any>,
    dbName?: string,
    refName?: string,
  ): Promise<any>;

  // QUERIES

  databases(): PR;

  currentDatabase(): Promise<string>;

  createDatabase(args: DBArgs): PR;

  getTableNames(args: RefArgs, filterSystemTables?: boolean): PR;

  getTables(args: RefArgs, tns: string[]): PR;

  getTableInfo(args: TableArgs): PR;

  getTableColumns(args: TableArgs): PR;

  getTableRows(args: TableArgs, page: TableRowPagination): PR;

  getSqlSelect(args: RefArgs & { queryString: string }): PR;

  getSchemas(args: RefArgs, type?: SchemaType): PR;

  getProcedures(args: RefArgs): PR;

  // DOLT-SPECIFIC QUERIES

  getBranch(args: BranchArgs): PR;

  getBranches(args: DBArgs & { sortBy?: SortBranchesBy }): PR;

  createNewBranch(args: BranchArgs & { fromRefName: string }): PR;

  callDeleteBranch(args: BranchArgs): PR;

  getLogs(args: RefArgs, offset: number): PR;

  getTwoDotLogs(args: RefsArgs): PR;

  getDiffStat(args: RefsArgs & { tableName?: string }): PR;

  getThreeDotDiffStat(args: RefsArgs & { tableName?: string }): PR;

  getDiffSummary(args: RefsArgs & { tableName?: string }): PR;

  getThreeDotDiffSummary(args: RefsArgs & { tableName?: string }): PR;

  getSchemaPatch(args: RefsArgs & { tableName: string }): PR;

  getThreeDotSchemaPatch(args: RefsArgs & { tableName: string }): PR;

  getSchemaDiff(args: RefsArgs & { tableName: string }): PR;

  getThreeDotSchemaDiff(args: RefsArgs & { tableName: string }): PR;

  getDocs(args: RefArgs): UPR;

  getStatus(args: RefArgs): PR;

  getTag(args: TagArgs): PR;

  getTags(args: DBArgs): PR;

  createNewTag(
    args: TagArgs & {
      fromRefName: string;
      message?: string;
    },
  ): PR;

  callDeleteTag(args: TagArgs): PR;

  callMerge(args: BranchesArgs): Promise<RawRow>;

  resolveRefs(
    args: RefsArgs & { type?: CommitDiffType },
  ): Promise<{ fromCommitId: string; toCommitId: string }>;

  getOneSidedRowDiff(
    args: TableArgs & { offset: number },
  ): Promise<{ rows: RawRows; columns: RawRows }>;

  getRowDiffs(
    args: DBArgs & {
      refName?: string;
      tableName: string;
      fromTableName: string;
      toTableName: string;
      fromCommitId: string;
      toCommitId: string;
      offset: number;
      filterByRowType?: DiffRowType;
    },
  ): Promise<{ colsUnion: RawRows; diff: RawRows }>;
}
