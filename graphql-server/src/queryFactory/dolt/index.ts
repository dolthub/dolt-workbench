import { QueryFactory } from "..";
import { SortBranchesBy } from "../../branches/branch.enum";
import * as column from "../../columns/column.model";
import { CommitDiffType } from "../../diffSummaries/diffSummary.enums";
import * as foreignKey from "../../indexes/foreignKey.model";
import * as index from "../../indexes/index.model";
import { convertToStringForQuery } from "../../rowDiffs/rowDiff.enums";
import { SchemaType } from "../../schemas/schema.enums";
import { SchemaItem } from "../../schemas/schema.model";
import {
  DoltSystemTable,
  systemTableValues,
} from "../../systemTables/systemTable.enums";
import { TableDetails } from "../../tables/table.model";
import { ROW_LIMIT, handleTableNotFound } from "../../utils";
import { MySQLQueryFactory } from "../mysql";
import * as myqh from "../mysql/queries";
import { mapTablesRes } from "../mysql/utils";
import * as t from "../types";
import * as qh from "./queries";
import { getAuthorString, handleRefNotFound, unionCols } from "./utils";

export class DoltQueryFactory
  extends MySQLQueryFactory
  implements QueryFactory
{
  isDolt = true;

  async getTableNames(
    args: t.RefArgs,
    filterSystemTables?: boolean,
  ): Promise<string[]> {
    return this.queryMultiple(
      async query => {
        const res: t.RawRows = await query(myqh.listTablesQuery, []);
        const tables = mapTablesRes(res);
        if (filterSystemTables) return tables;

        const systemTables: Array<string | undefined> = await Promise.all(
          systemTableValues.map(async st => {
            const cols = await handleTableNotFound(async () =>
              query(qh.columnsQuery, [st]),
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

  // TODO: Why does qr.getTable() not work for foreign keys for Dolt?
  async getTableInfo(args: t.TableArgs): Promise<TableDetails | undefined> {
    return this.queryMultiple(
      async query => getTableInfoWithQR(query, args),
      args.databaseName,
      args.refName,
    );
  }

  async getTables(args: t.RefArgs, tns: string[]): Promise<TableDetails[]> {
    return this.queryMultiple(
      async query => {
        const tableInfos = await Promise.all(
          tns.map(async name => {
            const tableInfo = await getTableInfoWithQR(query, {
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

  async getTablePKColumns(args: t.TableArgs): Promise<string[]> {
    const res: t.RawRows = await this.query(
      qh.tableColsQuery,
      [args.tableName],
      args.databaseName,
      args.refName,
    );
    return res.filter(c => c.Key === "PRI").map(c => c.Field);
  }

  async getSchemas(args: t.RefArgs, type?: SchemaType): Promise<SchemaItem[]> {
    return this.queryForBuilder(
      async em => {
        let sel = em
          .createQueryBuilder()
          .select("*")
          .from(DoltSystemTable.SCHEMAS, "");
        if (type) {
          sel = sel.where(`${DoltSystemTable.SCHEMAS}.type = :type`, {
            type,
          });
        }
        const res = await handleTableNotFound(async () => sel.getRawMany());
        if (!res) return [];
        return res.map(r => {
          return { name: r.name, type: r.type };
        });
      },
      args.databaseName,
      args.refName,
    );
  }

  async getProcedures(args: t.RefArgs): Promise<SchemaItem[]> {
    return this.queryForBuilder(
      async em => {
        const sel = em
          .createQueryBuilder()
          .select("*")
          .from(DoltSystemTable.PROCEDURES, "");
        const res = await handleTableNotFound(async () => sel.getRawMany());
        if (!res) return [];
        return res.map(r => {
          return {
            name: r.name,
            type: SchemaType.Procedure,
          };
        });
      },
      args.databaseName,
      args.refName,
    );
  }

  async getBranch(args: t.BranchArgs): t.UPR {
    return this.queryForBuilder(
      async em =>
        em
          .createQueryBuilder()
          .select("*")
          .from("dolt_branches", "")
          .where(`dolt_branches.name = :name`, {
            name: args.branchName,
          })
          .getRawOne(),
      args.databaseName,
    );
  }

  async getBranches(
    args: t.DBArgs & { sortBy?: SortBranchesBy; offset: number },
  ): t.PR {
    return this.queryForBuilder(async em => {
      const [orderBy, dir] = qh.getOrderByColForBranches(args.sortBy);
      return em
        .createQueryBuilder()
        .select("*")
        .from("dolt_branches", "")
        .addOrderBy(orderBy, dir)
        .limit(ROW_LIMIT + 1)
        .offset(args.offset)
        .getRawMany();
    }, args.databaseName);
  }

  async getAllBranches(args: t.DBArgs): t.PR {
    return this.queryForBuilder(
      async em =>
        em
          .createQueryBuilder()
          .select("*")
          .from("dolt_branches", "")
          .limit(1000)
          .getRawMany(),
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
        qh.doltLogsQuery,
        [args.refName, ROW_LIMIT + 1, offset],
        args.databaseName,
      ),
    );
  }

  async getTwoDotLogs(args: t.RefsArgs): t.PR {
    return handleRefNotFound(async () =>
      this.query(
        qh.twoDotDoltLogsQuery,
        [`${args.toRefName}..${args.fromRefName}`],
        args.databaseName,
      ),
    );
  }

  async getDiffStat(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      qh.getDiffStatQuery(!!args.tableName),
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffStat(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      qh.getThreeDotDiffStatQuery(!!args.tableName),
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getDiffSummary(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      qh.getDiffSummaryQuery(!!args.tableName),
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffSummary(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      qh.getThreeDotDiffSummaryQuery(!!args.tableName),
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaPatch(args: t.RefsTableArgs): t.PR {
    return this.query(
      qh.schemaPatchQuery,
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaPatch(args: t.RefsTableArgs): t.PR {
    return this.query(
      qh.threeDotSchemaPatchQuery,
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaDiff(args: t.RefsTableArgs): t.PR {
    return this.query(
      qh.schemaDiffQuery,
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaDiff(args: t.RefsTableArgs): t.PR {
    return this.query(
      qh.threeDotSchemaDiffQuery,
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getDocs(args: t.RefArgs): t.UPR {
    return this.queryForBuilder(
      async em => {
        const sel = em
          .createQueryBuilder()
          .select("*")
          .from(DoltSystemTable.DOCS, "");
        return handleTableNotFound(async () => sel.getRawMany());
      },
      args.databaseName,
      args.refName,
    );
  }

  async getStatus(args: t.RefArgs): t.PR {
    return this.queryForBuilder(
      async em =>
        em
          .createQueryBuilder()
          .select("*")
          .from("dolt_status", "")
          .getRawMany(),
      args.databaseName,
      args.refName,
    );
  }

  async getTag(args: t.TagArgs): t.UPR {
    return this.queryForBuilder(
      async em =>
        em
          .createQueryBuilder()
          .select("*")
          .from("dolt_tags", "")
          .where("dolt_tags.tag_name = :name", { name: args.tagName })
          .getRawOne(),
      args.databaseName,
    );
  }

  async getTags(args: t.DBArgs): t.PR {
    return this.queryForBuilder(
      async em =>
        em
          .createQueryBuilder()
          .select("*")
          .from("dolt_tags", "")
          .orderBy("dolt_tags.date", "DESC")
          .getRawMany(),
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
      const { q, cols } = qh.getRowsQueryAsOf(columns);
      const rows = await query(q, [
        args.tableName,
        args.refName,
        ...cols,
        ROW_LIMIT + 1,
        args.offset,
      ]);
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
  query: t.ParQuery,
  args: t.TableArgs,
): Promise<TableDetails> {
  const columns = await query(qh.columnsQuery, [args.tableName]);
  const fkRows = await query(qh.foreignKeysQuery, [
    args.tableName,
    `${args.databaseName}/${args.refName}`,
  ]);
  const idxRows = await query(qh.indexQuery, [args.tableName]);
  return {
    tableName: args.tableName,
    columns: columns.map(c => column.fromDoltRowRes(c, args.tableName)),
    foreignKeys: foreignKey.fromDoltRowsRes(fkRows),
    indexes: index.fromDoltRowsRes(idxRows),
  };
}
