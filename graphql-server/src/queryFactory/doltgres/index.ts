import { QueryRunner } from "typeorm";
import { QueryFactory } from "..";
import * as column from "../../columns/column.model";
import { CommitDiffType } from "../../diffSummaries/diffSummary.enums";
import * as foreignKey from "../../indexes/foreignKey.model";
import { SchemaType } from "../../schemas/schema.enums";
import { SchemaItem } from "../../schemas/schema.model";
import { systemTableValues } from "../../systemTables/systemTable.enums";
import { TableDetails } from "../../tables/table.model";
import { handleTableNotFound } from "../../utils";
import * as dem from "../dolt/doltEntityManager";
import { getAuthorString, handleRefNotFound, unionCols } from "../dolt/utils";
import { PostgresQueryFactory } from "../postgres";
import { getSchema, tableWithoutSchema } from "../postgres/utils";
import * as t from "../types";
import * as qh from "./queries";

export class DoltgresQueryFactory
  extends PostgresQueryFactory
  implements QueryFactory
{
  isDolt = true;

  async checkoutDatabase(
    qr: QueryRunner,
    dbName: string,
    refName?: string,
  ): Promise<void> {
    await qr.query(qh.useDB(dbName, refName, this.isDolt));
  }

  async getTableNames(
    args: t.RefMaybeSchemaArgs,
    filterSystemTables?: boolean,
  ): Promise<string[]> {
    const revDb = `${args.databaseName}/${args.refName}`;
    return this.queryQR(
      async qr => {
        const schema = await getSchema(qr, args);
        const res: t.RawRows = await qr.query(qh.listTablesQuery, [
          schema,
          revDb,
        ]);
        const tables = res.map(tbl => tbl.table_name);
        if (filterSystemTables) return tables;

        const systemTables: Array<string | undefined> = await Promise.all(
          systemTableValues.map(async st => {
            const cols = await handleTableNotFound(async () =>
              qr.query(qh.columnsQuery(schema, st)),
            );
            if (cols) {
              return `${st}`;
            }
            return undefined;
          }),
        );
        return [...tables, ...(systemTables.filter(st => !!st) as string[])];
      },
      args.databaseName,
      args.refName,
    );
  }

  // TODO:  qr.getTable() does not allow specifying a database for doltgres
  async getTableInfo(
    args: t.TableMaybeSchemaArgs,
  ): Promise<TableDetails | undefined> {
    return this.queryQR(
      async qr => getTableInfoWithQR(qr, args),
      args.databaseName,
      args.refName,
    );
  }

  async getTables(
    args: t.RefMaybeSchemaArgs,
    tns: string[],
  ): Promise<TableDetails[]> {
    return this.queryQR(
      async qr => {
        const tableInfos = await Promise.all(
          tns.map(async name => {
            const tableInfo = await getTableInfoWithQR(qr, {
              ...args,
              tableName: name,
            });
            return tableInfo;
          }),
        );
        return tableInfos;
      },
      args.databaseName,
      args.refName,
    );
  }

  async getTablePKColumns(args: t.TableMaybeSchemaArgs): Promise<string[]> {
    const res = await this.getTableInfo(args);
    if (!res) return [];
    return res.columns.filter(c => c.isPrimaryKey).map(c => c.name);
  }

  async getSchemas(
    args: t.RefMaybeSchemaArgs,
    type?: SchemaType,
  ): Promise<SchemaItem[]> {
    return this.queryQR(
      async qr => {
        const schema = await getSchema(qr, args);
        return dem.getDoltSchemas(qr.manager, type, schema);
      },
      args.databaseName,
      args.refName,
    );
  }

  async getProcedures(args: t.RefArgs): Promise<SchemaItem[]> {
    return this.queryForBuilder(
      async em => dem.getDoltProcedures(em),
      args.databaseName,
      args.refName,
    );
  }

  async getBranch(args: t.BranchArgs): t.USPR {
    return this.queryForBuilder(
      async em => dem.getDoltBranch(em, args),
      args.databaseName,
    );
  }

  async getBranches(args: t.ListBranchesArgs): t.PR {
    return this.queryForBuilder(
      async em => dem.getDoltBranchesPaginated(em, args),
      args.databaseName,
    );
  }

  async getAllBranches(args: t.DBArgs): t.PR {
    return this.queryForBuilder(
      async em => dem.getAllDoltBranches(em),
      args.databaseName,
    );
  }

  async createNewBranch(args: t.BranchArgs & { fromRefName: string }): t.PR {
    return this.query(
      qh.callNewBranch,
      [args.branchName, args.fromRefName],
      args.databaseName,
    );
  }

  async callDeleteBranch(args: t.BranchArgs): t.PR {
    return this.query(
      qh.callDeleteBranch,
      [args.branchName],
      args.databaseName,
    );
  }

  async getLogs(args: t.RefArgs, offset: number): t.PR {
    return handleRefNotFound(async () =>
      this.query(qh.doltLogsQuery(args, offset), [], args.databaseName),
    );
  }

  async getTwoDotLogs(args: t.RefsArgs): t.PR {
    return handleRefNotFound(async () =>
      this.query(qh.twoDotDoltLogsQuery(args), [], args.databaseName),
    );
  }

  async getDiffStat(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      qh.getDiffStatQuery(args),
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffStat(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      qh.getThreeDotDiffStatQuery(args),
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getDiffSummary(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      qh.getDiffSummaryQuery(args),
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffSummary(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      qh.getThreeDotDiffSummaryQuery(args),
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaPatch(args: t.RefsTableWithSchemaArgs): t.PR {
    return this.query(
      qh.schemaPatchQuery(args),
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaPatch(args: t.RefsTableWithSchemaArgs): t.PR {
    return this.query(
      qh.threeDotSchemaPatchQuery(args),
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaDiff(args: t.RefsTableWithSchemaArgs): t.PR {
    return this.query(
      qh.schemaDiffQuery(args),
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaDiff(args: t.RefsTableWithSchemaArgs): t.PR {
    return this.query(
      qh.threeDotSchemaDiffQuery(args),
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getDocs(args: t.RefArgs): t.UPR {
    return this.queryForBuilder(
      async em => dem.getDoltDocs(em),
      args.databaseName,
      args.refName,
    );
  }

  async getStatus(args: t.RefArgs): t.PR {
    return this.queryForBuilder(
      async em => dem.getDoltStatus(em),
      args.databaseName,
      args.refName,
    );
  }

  async getTag(args: t.TagArgs): t.UPR {
    return this.queryForBuilder(
      async em => dem.getDoltTag(em, args),
      args.databaseName,
    );
  }

  async getTags(args: t.DBArgs): t.PR {
    return this.queryForBuilder(
      async em => dem.getDoltTags(em),
      args.databaseName,
    );
  }

  async createNewTag(
    args: t.TagArgs & {
      fromRefName: string;
      message?: string;
      author?: t.CommitAuthor;
    },
  ): t.PR {
    const params = [args.tagName, args.fromRefName];
    if (args.message) {
      params.push(args.message);
    }
    if (args.author) {
      params.push(getAuthorString(args.author));
    }
    return this.query(
      qh.getCallNewTag(!!args.message, !!args.author),
      params,
      args.databaseName,
    );
  }

  async callDeleteTag(args: t.TagArgs): t.PR {
    return this.query(qh.callDeleteTag, [args.tagName], args.databaseName);
  }

  async callMerge(
    args: t.BranchesArgs & { author?: t.CommitAuthor },
  ): Promise<boolean> {
    return this.queryMultiple(
      async query => {
        await query("BEGIN");

        const params = [
          args.fromBranchName,
          `Merge branch ${args.fromBranchName}`,
        ];
        if (args.author) {
          params.push(getAuthorString(args.author));
        }
        const res = await query(qh.getCallMerge(!!args.author), params);

        if (res.length && res[0].dolt_merge[2] !== "0") {
          await query("ROLLBACK");
          const msg = res[0].dolt_merge[3] ?? "Merge conflict detected";
          throw new Error(msg);
        }

        await query("COMMIT");
        return true;
      },
      args.databaseName,
      args.toBranchName,
    );
  }

  async resolveRefs(
    args: t.RefsArgs & { type?: CommitDiffType },
  ): t.CommitsRes {
    if (args.type !== CommitDiffType.ThreeDot) {
      return { fromCommitId: args.fromRefName, toCommitId: args.toRefName };
    }
    return this.queryMultiple(
      async query => {
        const toCommitId = await query(qh.hashOf, [args.fromRefName]);
        const mergeBaseCommit = await query(qh.mergeBase, [
          args.toRefName,
          args.fromRefName,
        ]);
        return {
          fromCommitId: Object.values(mergeBaseCommit[0])[0],
          toCommitId: Object.values(toCommitId[0])[0],
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async getOneSidedRowDiff(
    args: t.TableMaybeSchemaArgs & { offset: number },
  ): Promise<{ rows: t.RawRows; columns: t.RawRows }> {
    return this.queryMultiple(async query => {
      const columns = await query(
        qh.tableColsQueryAsOf(args.tableName, args.refName),
      );
      const rows = await query(qh.getRowsQueryAsOf(columns, args));
      return { rows, columns };
    }, args.databaseName);
  }

  async getRowDiffs(args: t.RowDiffArgs): t.DiffRes {
    return this.queryMultiple(
      async query => {
        const oldCols = await query(
          qh.tableColsQueryAsOf(args.fromTableName, args.fromCommitId),
        );
        const newCols = await query(
          qh.tableColsQueryAsOf(args.toTableName, args.toCommitId),
        );
        const colsUnion = unionCols(oldCols, newCols);

        const diff = await query(qh.getTableCommitDiffQuery(args, colsUnion));
        return { colsUnion, diff };
      },
      args.databaseName,
      args.refName,
    );
  }

  async restoreAllTables(args: t.RefArgs): t.PR {
    return this.queryQR(
      async qr => {
        console.log("[restore_all]: starting transaction");
        await qr.query("BEGIN");

        console.log("[restore_all]: calling");
        const res = await qr.query(qh.callResetHard);
        if (res.length && res[0].dolt_reset[0] !== "0") {
          console.log("[restore_all]: reset not successful, rolling back");
          await qr.query("ROLLBACK");
          throw new Error("Reset --hard not successful");
        }

        // Handles any new tables that weren't restored by dolt_reset(--hard)
        const status = await dem.getDoltStatus(qr.manager);
        if (status.length) {
          status.forEach(async r => {
            console.log("[restore_all]: checking out new table", r.table_name);
            const checkRes = await qr.query(qh.callCheckoutTable, [
              tableWithoutSchema(r.table_name),
            ]);
            if (checkRes.length && checkRes[0].dolt_checkout[0] !== "0") {
              console.log(
                "[restore_all]: checkout not successful, rolling back",
              );
              await qr.query("ROLLBACK");
              throw new Error(
                `Checking out table not successful: ${checkRes[0].message}`,
              );
            }
          });
        }

        console.log("[restore_all]: committing");
        await qr.query("COMMIT");
        return res;
      },
      args.databaseName,
      args.refName,
    );
  }

  async getRemotes(args: t.DBArgs): t.PR {
    return this.queryForBuilder(
      async em => dem.getDoltRemotes(em),
      args.databaseName,
    );
  }

  async addRemote(args: t.AddRemoteArgs): t.PR {
    return this.query(
      qh.callAddRemote,
      [args.remoteName, args.remoteUrl],
      args.databaseName,
    );
  }
}

async function getTableInfoWithQR(
  qr: QueryRunner,
  args: t.TableMaybeSchemaArgs,
): Promise<TableDetails> {
  const revDb = `${args.databaseName}/${args.refName}`;
  const schema = await getSchema(qr, args);
  const columns = await qr.query(qh.columnsQuery(schema, args.tableName));
  const fkRows = await qr.query(qh.foreignKeysQuery, [
    args.tableName,
    schema,
    revDb,
  ]);
  // const idxRows = await qr.query(qh.indexQuery, [schema, args.tableName]);

  return {
    tableName: args.tableName,
    columns: columns.map(c => column.fromDoltRowRes(c, args.tableName)),
    foreignKeys: foreignKey.fromDoltRowsRes(fkRows),
    // indexes: index.fromDoltRowsRes(idxRows), // TODO
    indexes: [],
  };
}
