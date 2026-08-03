import { QueryRunner } from "typeorm";
import { QueryFactory } from "..";
import { SchemaType } from "../../schemas/schema.enums";
import { SchemaItem } from "../../schemas/schema.model";
import { TableDetails } from "../../tables/table.model";
import { MySQLQueryFactory } from "../mysql";
import {
  getTableInfo,
  getTablePKColumns,
  getTableRows,
  getTables,
} from "../mysql/utils";
import * as t from "../types";
import * as qh from "./queries";
import { changeSchema, getSchema, tableWithSchema } from "./utils";
import { buildCreateView } from "../build/buildCreateView";
import { buildDeleteRow } from "../build/buildDeleteRow";
import { buildDropColumn } from "../build/buildDropColumn";
import { buildDropTable } from "../build/buildDropTable";
import { buildInsertRow } from "../build/buildInsertRow";
import { buildSelectTableRows } from "../build/buildSelectTableRows";
import { buildUpdateRow } from "../build/buildUpdateRow";
import { ROW_LIMIT } from "../../utils";
import {
  DDL_EXECUTION_MESSAGE,
  mutationExecutionMessage,
} from "../build/buildUtils";
import { classifyPgResult } from "./classifyResult";
import { resolvePgResultColumns } from "./resultColumns";

export class PostgresQueryFactory
  extends MySQLQueryFactory
  implements QueryFactory
{
  isDolt = false;

  async databases(): Promise<string[]> {
    const res: t.RawRows = await this.query(qh.databasesQuery, []);
    return res
      .map(r => r.datname)
      .filter(
        d =>
          d !== "template0" &&
          d !== "template1" &&
          d !== "dolt_cluster" &&
          !d.includes("/"),
      );
  }

  async schemas(args: t.RefArgs): Promise<string[]> {
    const res: t.RawRows = await this.query(
      qh.schemasQuery,
      [
        args.refName && this.isDolt
          ? `${args.databaseName}/${args.refName}`
          : args.databaseName,
      ],
      args.databaseName,
      args.refName,
    );
    return res.filter(s => s.schema_name !== "dolt").map(r => r.schema_name);
  }

  async createSchema(args: t.RefSchemaArgs): Promise<void> {
    return this.queryQR(
      async qr => qr.createSchema(args.schemaName),
      args.databaseName,
      args.refName,
    );
  }

  async checkoutDatabase(qr: QueryRunner, dbName: string): Promise<void> {
    const currentDb = await qr.getCurrentDatabase();
    if (dbName !== currentDb) {
      throw new Error("Databases do not match");
    }
  }

  async getTableNames(args: t.RefMaybeSchemaArgs): Promise<string[]> {
    return this.queryQR(
      async qr => {
        const schema = await getSchema(qr, args);
        const res: t.RawRows = await qr.query(qh.listTablesQuery, [schema]);
        return res.map(r => r.tablename);
      },
      args.databaseName,
      args.refName,
    );
  }

  async getTableInfo(
    args: t.TableMaybeSchemaArgs,
  ): Promise<TableDetails | undefined> {
    return this.queryQR(
      async qr => {
        const schema = await getSchema(qr, args);
        return getTableInfo(qr, `${schema}.${args.tableName}`);
      },
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
        const schema = await getSchema(qr, args);
        const names = tns.map(tn =>
          tableWithSchema({ tableName: tn, schemaName: schema }),
        );
        return getTables(qr, names);
      },
      args.databaseName,
      args.refName,
    );
  }

  async getTablePKColumns(args: t.TableMaybeSchemaArgs): Promise<string[]> {
    return this.queryQR(
      async qr => {
        const schemaName = await getSchema(qr, args);
        return getTablePKColumns(qr, tableWithSchema({ ...args, schemaName }));
      },
      args.databaseName,
      args.refName,
    );
  }

  async getTableRows(
    args: t.TableMaybeSchemaArgs,
    page: t.TableRowPagination,
  ): t.PR {
    return this.queryQR(
      async qr => {
        const schemaName = await getSchema(qr, args);
        return getTableRows(
          qr.manager,
          tableWithSchema({ ...args, schemaName }),
          page,
        );
      },
      args.databaseName,
      args.refName,
    );
  }

  async deleteRow(args: t.DeleteRowArgs): Promise<t.MutationResult> {
    return this.queryQR(
      async qr => {
        const schemaName = await getSchema(qr, args);
        const target = tableWithSchema({
          tableName: args.tableName,
          schemaName,
        });
        const built = buildDeleteRow(qr.manager, target, args.where);
        const result = await built.execute();
        const rowsAffected = result.affected ?? 0;
        return {
          rowsAffected,
          queryString: built.displaySql,
          executionMessage: mutationExecutionMessage(rowsAffected),
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async insertRow(args: t.InsertRowArgs): Promise<t.MutationResult> {
    return this.queryQR(
      async qr => {
        const schemaName = await getSchema(qr, args);
        const target = tableWithSchema({
          tableName: args.tableName,
          schemaName,
        });
        const built = buildInsertRow(qr.manager, target, args.values);
        await built.execute();
        const rowsAffected = 1;
        return {
          rowsAffected,
          queryString: built.displaySql,
          executionMessage: mutationExecutionMessage(rowsAffected),
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async previewInsertRow(args: t.InsertRowArgs): Promise<string> {
    return this.queryQR(
      async qr => {
        const schemaName = await getSchema(qr, args);
        const target = tableWithSchema({
          tableName: args.tableName,
          schemaName,
        });
        return buildInsertRow(qr.manager, target, args.values).displaySql;
      },
      args.databaseName,
      args.refName,
    );
  }

  async updateRow(args: t.UpdateRowArgs): Promise<t.MutationResult> {
    return this.queryQR(
      async qr => {
        const schemaName = await getSchema(qr, args);
        const target = tableWithSchema({
          tableName: args.tableName,
          schemaName,
        });
        const built = buildUpdateRow(qr.manager, target, args.set, args.where);
        const result = await built.execute();
        const rowsAffected = result.affected ?? 0;
        return {
          rowsAffected,
          queryString: built.displaySql,
          executionMessage: mutationExecutionMessage(rowsAffected),
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async dropColumn(args: t.DropColumnArgs): Promise<t.MutationResult> {
    return this.queryQR(
      async qr => {
        const schemaName = await getSchema(qr, args);
        const target = tableWithSchema({
          tableName: args.tableName,
          schemaName,
        });
        const built = buildDropColumn(qr.manager, target, args.columnName);
        await built.execute();
        return {
          rowsAffected: 0,
          queryString: built.displaySql,
          executionMessage: DDL_EXECUTION_MESSAGE,
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async dropTable(args: t.TableMaybeSchemaArgs): Promise<t.MutationResult> {
    return this.queryQR(
      async qr => {
        const schemaName = await getSchema(qr, args);
        const target = tableWithSchema({
          tableName: args.tableName,
          schemaName,
        });
        const built = buildDropTable(qr.manager, target);
        await built.execute();
        return {
          rowsAffected: 0,
          queryString: built.displaySql,
          executionMessage: DDL_EXECUTION_MESSAGE,
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async createView(args: t.CreateViewArgs): Promise<t.MutationResult> {
    return this.queryQR(
      async qr => {
        const schemaName = await getSchema(qr, args);
        const target = tableWithSchema({
          tableName: args.name,
          schemaName,
        });
        const built = buildCreateView(qr.manager, target, args.queryString);
        await built.execute();
        return {
          rowsAffected: 0,
          queryString: built.displaySql,
          executionMessage: DDL_EXECUTION_MESSAGE,
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async selectTableRows(
    args: t.SelectTableRowsArgs,
  ): Promise<t.SqlSelectResult> {
    return this.queryQR(
      async qr => {
        const schemaName = await getSchema(qr, args);
        const target = tableWithSchema({
          tableName: args.tableName,
          schemaName,
        });
        const built = buildSelectTableRows(qr.manager, target, {
          orderBy: args.orderBy,
          where: args.where,
          excludePks: args.excludePks,
          projection: args.projection,
          offset: args.offset,
          limit: ROW_LIMIT + 1,
        });
        const rows = await built.execute();
        return {
          rows,
          isMutation: false,
          executionMessage: "",
          queryString: built.displaySql,
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async schemaDefinition(
    args: t.SchemaDefinitionArgs,
  ): Promise<t.SqlSelectResult> {
    return this.queryQR(
      async qr => {
        const schemaName = await getSchema(qr, args);
        const sql = postgresSchemaDefinitionSql(
          args.name,
          args.kind,
          this.catalogName(args),
          schemaName,
        );
        const conn = await qr.connect();
        const res = await conn.query(sql, []);
        return { ...classifyPgResult(res), queryString: sql };
      },
      args.databaseName,
      args.refName,
    );
  }

  protected catalogName(args: t.RefArgs): string {
    return args.databaseName;
  }

  // TODO: get warnings for postgres
  async getSqlSelect(
    args: t.RefMaybeSchemaArgs & { queryString: string },
  ): Promise<t.SqlSelectResult> {
    return this.queryQR(
      async qr => {
        if (args.schemaName) {
          await changeSchema(qr, args.schemaName);
        }
        const conn = await qr.connect();
        const res = await conn.query(args.queryString, []);
        const classified = classifyPgResult(res);
        if (classified.isMutation) {
          return classified;
        }
        return {
          ...classified,
          columns: await resolvePgResultColumns(qr, res.fields),
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async getSchemas(
    args: t.RefMaybeSchemaArgs,
    type?: SchemaType,
  ): Promise<SchemaItem[]> {
    return this.queryQR(async qr => {
      const schema = await getSchema(qr, args);

      const vRes = await qr.query(qh.getViewsQuery, [schema]);
      const views = vRes.map(v => {
        return { name: v.table_name, type: SchemaType.View };
      });
      if (type === SchemaType.View) {
        return views;
      }
      const tRes = await qr.query(qh.getTriggersQuery, [schema]);
      const triggers = tRes.map(tr => {
        return { name: tr.trigger_name, type: SchemaType.Trigger };
      });

      const eRes = await qr.query(qh.getEventsQuery);
      const events = eRes.map(e => {
        return { name: e.evtname, type: SchemaType.Event };
      });
      return [...views, ...triggers, ...events];
    }, args.databaseName);
  }

  async getProcedures(args: t.DBArgs): Promise<SchemaItem[]> {
    const res: t.RawRows = await this.query(
      qh.getProceduresQuery,
      [args.databaseName],
      args.databaseName,
    );
    return res.map(r => {
      return { name: r.proname, type: SchemaType.Procedure };
    });
  }
}

function postgresSchemaDefinitionSql(
  name: string,
  kind: SchemaType,
  dbName: string,
  schemaName: string,
): string {
  const esc = (s: string) => s.replace(/'/g, "''");
  switch (kind) {
    case SchemaType.Table:
      return `SELECT ordinal_position, column_name, udt_name as data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = '${esc(schemaName)}' AND table_catalog = '${esc(dbName)}' AND table_name = '${esc(name)}'`;
    case SchemaType.View:
      return `SELECT pg_get_viewdef('${esc(schemaName)}.${esc(name)}'::regclass, true)`;
    case SchemaType.Trigger:
      return `SELECT pg_get_triggerdef(oid) FROM pg_trigger where tgname = '${esc(name)}'`;
    case SchemaType.Event:
      return `SELECT * FROM pg_event_trigger WHERE evtname = '${esc(name)}'`;
    case SchemaType.Procedure:
      return `SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = '${esc(name)}'`;
    default:
      return "";
  }
}
