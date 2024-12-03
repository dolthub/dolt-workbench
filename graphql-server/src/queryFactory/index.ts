import { DataSource, EntityManager, QueryRunner } from "typeorm";
import { CommitDiffType } from "../diffSummaries/diffSummary.enums";
import { SchemaType } from "../schemas/schema.enums";
import { SchemaItem } from "../schemas/schema.model";
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

  schemas?(args: t.RefArgs): Promise<string[]>;

  createDatabase(args: t.DBArgs): Promise<void>;

  createSchema?(args: t.SchemaArgs & { refName: string }): Promise<void>;

  getTableNames(
    args: t.RefMaybeSchemaArgs,
    filterSystemTables?: boolean,
  ): Promise<string[]>;

  getTables(args: t.RefMaybeSchemaArgs, tns: string[]): Promise<TableDetails[]>;

  getTableInfo(args: t.TableMaybeSchemaArgs): Promise<TableDetails | undefined>;

  getTablePKColumns(args: t.TableMaybeSchemaArgs): Promise<string[]>;

  getTableRows(args: t.TableMaybeSchemaArgs, page: t.TableRowPagination): t.PR;

  getSqlSelect(args: t.RefMaybeSchemaArgs & { queryString: string }): t.PR;

  getSchemas(
    args: t.RefMaybeSchemaArgs,
    type?: SchemaType,
  ): Promise<SchemaItem[]>;

  getProcedures(args: t.RefArgs): Promise<SchemaItem[]>;

  // DOLT-SPECIFIC QUERIES

  getBranch(args: t.BranchArgs): t.USPR;

  getBranches(args: t.ListBranchesArgs): t.PR;

  getAllBranches(args: t.DBArgs): t.PR;

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
      author?: t.CommitAuthor;
    },
  ): t.PR;

  callDeleteTag(args: t.TagArgs): t.PR;

  callMerge(
    args: t.BranchesArgs & { author?: t.CommitAuthor },
  ): Promise<boolean>;

  resolveRefs(
    args: t.RefsArgs & { type?: CommitDiffType },
  ): Promise<{ fromCommitId: string; toCommitId: string }>;

  getOneSidedRowDiff(
    args: t.TableArgs & { offset: number },
  ): Promise<{ rows: t.RawRows; columns: t.RawRows }>;

  getRowDiffs(args: t.RowDiffArgs): t.DiffRes;

  restoreAllTables(args: t.RefArgs): t.PR;

  getRemotes(args: t.DBArgs): t.PR;

  addRemote(args: t.AddRemoteArgs): t.PR;

  callDeleteRemote(args: t.RemoteArgs): t.PR;
}
