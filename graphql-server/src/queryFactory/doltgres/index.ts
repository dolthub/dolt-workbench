import { QueryRunner } from "typeorm";
import { QueryFactory } from "..";
import { CommitDiffType } from "../../diffSummaries/diffSummary.enums";
import * as foreignKey from "../../indexes/foreignKey.model";
import { convertToStringForQuery } from "../../rowDiffs/rowDiff.enums";
import { SchemaType } from "../../schemas/schema.enums";
import { SchemaItem } from "../../schemas/schema.model";
import { systemTableValues } from "../../systemTables/systemTable.enums";
import { TableDetails } from "../../tables/table.model";
import { ROW_LIMIT, handleTableNotFound } from "../../utils";
import * as dem from "../dolt/doltEntityManager";
import { getAuthorString, handleRefNotFound, unionCols } from "../dolt/utils";
import { PostgresQueryFactory } from "../postgres";
import { getSchema, tableWithSchema } from "../postgres/utils";
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
              qr.query(qh.columnsQuery, [st, schema, revDb]),
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
    return this.queryForBuilder(
      async em => dem.getDoltSchemas(em, type),
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
      this.query(
        `SELECT * FROM DOLT_LOG('${args.refName}', '--parents') LIMIT ${ROW_LIMIT + 1} OFFSET ${offset}`,
        [],
        args.databaseName,
      ),
    );
  }

  async getTwoDotLogs(args: t.RefsArgs): t.PR {
    return handleRefNotFound(async () =>
      this.query(
        `SELECT * FROM DOLT_LOG('${args.toRefName}..${args.fromRefName}', '--parents')`,
        [],
        args.databaseName,
      ),
    );
  }

  async getDiffStat(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      `SELECT * FROM DOLT_DIFF_STAT('${args.fromRefName}', '${args.toRefName}'${args.tableName ? `, '${tableWithSchema({ ...args, tableName: args.tableName })}'` : ""})`,
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffStat(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      `SELECT * FROM DOLT_DIFF_STAT('${args.toRefName}...${args.fromRefName}'${args.tableName ? `, '${tableWithSchema({ ...args, tableName: args.tableName })}'` : ""})`,
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getDiffSummary(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      `SELECT * FROM DOLT_DIFF_SUMMARY('${args.fromRefName}', '${args.toRefName}'${args.tableName ? `, '${tableWithSchema({ ...args, tableName: args.tableName })}'` : ""})`,
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffSummary(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      `SELECT * FROM DOLT_DIFF_SUMMARY('${args.toRefName}...${args.fromRefName}'${args.tableName ? `, '${tableWithSchema({ ...args, tableName: args.tableName })}'` : ""})`,
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaPatch(args: t.RefsTableWithSchemaArgs): t.PR {
    return this.query(
      `SELECT * FROM DOLT_PATCH('${args.fromRefName}', '${args.toRefName}', '${tableWithSchema(args)}') WHERE diff_type='schema'`,
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaPatch(args: t.RefsTableWithSchemaArgs): t.PR {
    return this.query(
      `SELECT * FROM DOLT_PATCH('${args.toRefName}...${args.fromRefName}', '${tableWithSchema(args)}') WHERE diff_type='schema'`,
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaDiff(args: t.RefsTableWithSchemaArgs): t.PR {
    return this.query(
      `SELECT * FROM DOLT_SCHEMA_DIFF('${args.fromRefName}', '${args.toRefName}', '${tableWithSchema(args)}')`,
      [],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaDiff(args: t.RefsTableWithSchemaArgs): t.PR {
    return this.query(
      `SELECT * FROM DOLT_SCHEMA_DIFF('${args.toRefName}...${args.fromRefName}', '${tableWithSchema(args)}')`,
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
        const res = await query(
          `SELECT DOLT_MERGE('${args.fromBranchName}', '--no-ff', '-m', 'Merge branch ${args.fromBranchName}'${qh.getAuthorNameString(!!args.author, `'${args.author}'`)})`,
          params,
        );

        if (res.length && res[0].conflicts !== "0") {
          await query("ROLLBACK");
          throw new Error("Merge conflict detected");
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
    args: t.TableArgs & { offset: number },
  ): Promise<{ rows: t.RawRows; columns: t.RawRows }> {
    return this.queryMultiple(async query => {
      const columns = await query(qh.tableColsQueryAsOf, [
        args.tableName,
        args.refName,
      ]);
      const { q, cols } = qh.getRowsQueryAsOf(columns, args);
      const rows = await query(q, [...cols, ROW_LIMIT + 1, args.offset]);
      return { rows, columns };
    }, args.databaseName);
  }

  async getRowDiffs(args: t.RowDiffArgs): t.DiffRes {
    return this.queryMultiple(
      async query => {
        const oldCols = await query(qh.tableColsQueryAsOf, [
          args.fromTableName,
          args.fromCommitId,
        ]);
        const newCols = await query(qh.tableColsQueryAsOf, [
          args.toTableName,
          args.toCommitId,
        ]);
        const colsUnion = unionCols(oldCols, newCols);
        const diffType = convertToStringForQuery(args.filterByRowType);
        const refArgs = [args.fromCommitId, args.toCommitId, args.toTableName];
        const pageArgs = [ROW_LIMIT + 1, args.offset];
        const diff = await query(
          qh.getTableCommitDiffQuery(colsUnion, !!diffType),
          diffType
            ? [...refArgs, diffType, ...pageArgs]
            : [...refArgs, ...pageArgs],
        );
        return { colsUnion, diff };
      },
      args.databaseName,
      args.refName,
    );
  }
}

async function getTableInfoWithQR(
  qr: QueryRunner,
  args: t.TableMaybeSchemaArgs,
): Promise<TableDetails> {
  const revDb = `${args.databaseName}/${args.refName}`;
  const schema = await getSchema(qr, args);
  const columns = await qr.query(qh.columnsQuery, [
    args.tableName,
    schema,
    revDb,
  ]);
  const constraints = await qr.query(qh.constraintsQuery, [
    schema,
    args.tableName,
  ]);
  const fkRows = await qr.query(qh.foreignKeysQuery, [
    args.tableName,
    schema,
    revDb,
  ]);
  // const idxRows = await qr.query(qh.indexQuery, [schema, args.tableName]);

  return {
    tableName: args.tableName,
    columns: columns.map(c => {
      return {
        name: c.column_name,
        isPrimaryKey: !!constraints.find(
          con =>
            con.column_name === c.column_name &&
            con.constraint_type === "PRIMARY",
        ),
        type: `${c.data_type}${c.character_maximum_length ? `(${c.character_maximum_length})` : ""}${
          c.unsigned ? " unsigned" : ""
        }`,
        constraints: [{ notNull: c.is_nullable === "NO" }],
        sourceTable: c.table_name,
      };
    }),
    foreignKeys: foreignKey.fromDoltRowsRes(fkRows),
    // indexes: index.fromDoltRowsRes(idxRows), // TODO
    indexes: [],
  };
}
