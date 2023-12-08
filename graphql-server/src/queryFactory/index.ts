import { DataSource, EntityManager, QueryRunner } from "typeorm";
import { SortBranchesBy } from "../branches/branch.enum";
import { CommitDiffType } from "../diffSummaries/diffSummary.enums";
import { SchemaType } from "../schemas/schema.enums";
import { TableDetails } from "../tables/table.model";
import * as t from "./types";

export declare class QueryFactory {
  ds: DataSource | undefined;

  isDolt: boolean;

  constructor(ds: DataSource | undefined);

  // UTILS

  getDS(): DataSource;

  getQR(): QueryRunner;

  handleAsyncQuery<T>(work: (qr: QueryRunner) => Promise<T>): Promise<T>;

  query<T>(
    q: string,
    p: t.Params,
    dbName?: string,
    refName?: string,
  ): Promise<T>;

  queryMultiple<T>(
    executeQuery: (pq: t.ParQuery) => Promise<T>,
    dbName?: string,
    refName?: string,
  ): Promise<T>;

  queryForBuilder<T>(
    executeQuery: (em: EntityManager) => Promise<T>,
    dbName?: string,
    refName?: string,
  ): Promise<T>;

  queryQR<T>(
    executeQuery: (qr: QueryRunner) => Promise<T>,
    dbName?: string,
    refName?: string,
  ): Promise<T>;

  // QUERIES

  databases(): Promise<string[]>;

  currentDatabase(): Promise<string | undefined>;

  createDatabase(args: t.DBArgs): Promise<void>;

  getTableNames(
    args: t.RefArgs,
    filterSystemTables?: boolean,
  ): Promise<string[]>;

  getTables(args: t.RefArgs, tns: string[]): Promise<TableDetails[]>;

  getTableInfo(args: t.TableArgs): Promise<TableDetails | undefined>;

  getTablePKColumns(args: t.TableArgs): Promise<string[]>;

  getTableRows(args: t.TableArgs, page: t.TableRowPagination): t.PR;

  getSqlSelect(args: t.RefArgs & { queryString: string }): t.PR;

  getSchemas(args: t.RefArgs, type?: SchemaType): t.UPR;

  getProcedures(args: t.RefArgs): t.UPR;

  // DOLT-SPECIFIC QUERIES

  getBranch(args: t.BranchArgs): t.UPR;

  getBranches(args: t.DBArgs & { sortBy?: SortBranchesBy }): t.PR;

  createNewBranch(args: t.BranchArgs & { fromRefName: string }): t.PR;

  callDeleteBranch(args: t.BranchArgs): t.PR;

  getLogs(args: t.RefArgs, offset: number): t.PR;

  getTwoDotLogs(args: t.RefsArgs): t.PR;

  getDiffStat(args: t.RefsMaybeTableArgs): t.PR;

  getThreeDotDiffStat(args: t.RefsMaybeTableArgs): t.PR;

  getDiffSummary(args: t.RefsMaybeTableArgs): t.PR;

  getThreeDotDiffSummary(args: t.RefsMaybeTableArgs): t.PR;

  getSchemaPatch(args: t.RefsTableArgs): t.PR;

  getThreeDotSchemaPatch(args: t.RefsTableArgs): t.PR;

  getSchemaDiff(args: t.RefsTableArgs): t.PR;

  getThreeDotSchemaDiff(args: t.RefsTableArgs): t.PR;

  getDocs(args: t.RefArgs): t.UPR;

  getStatus(args: t.RefArgs): t.PR;

  getTag(args: t.TagArgs): t.UPR;

  getTags(args: t.DBArgs): t.PR;

  createNewTag(
    args: t.TagArgs & {
      fromRefName: string;
      message?: string;
    },
  ): t.PR;

  callDeleteTag(args: t.TagArgs): t.PR;

  callMerge(args: t.BranchesArgs): Promise<boolean>;

  resolveRefs(
    args: t.RefsArgs & { type?: CommitDiffType },
  ): Promise<{ fromCommitId: string; toCommitId: string }>;

  getOneSidedRowDiff(
    args: t.TableArgs & { offset: number },
  ): Promise<{ rows: t.RawRows; columns: t.RawRows }>;

  getRowDiffs(args: t.RowDiffArgs): t.DiffRes;
}
