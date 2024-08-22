import { QueryRunner } from "typeorm";
import { QueryFactory } from "..";
import { SchemaType } from "../../schemas/schema.enums";
import { SchemaItem } from "../../schemas/schema.model";
import { TableDetails } from "../../tables/table.model";
import { ROW_LIMIT } from "../../utils";
import { MySQLQueryFactory } from "../mysql";
import { convertToTableDetails } from "../mysql/utils";
import * as t from "../types";
import * as qh from "./queries";
import { getSchema } from "./util";

export class PostgresQueryFactory
  extends MySQLQueryFactory
  implements QueryFactory
{
  isDolt = false;

  async databases(): Promise<string[]> {
    const res: t.RawRows = await this.query(qh.databasesQuery, []);
    return res.map(r => r.datname);
  }

  async schemas(args: t.DBArgs): Promise<string[]> {
    const res: t.RawRows = await this.query(qh.schemasQuery, [
      args.databaseName,
    ]);
    return res.map(r => r.schema_name);
  }

  async createSchema(args: t.SchemaArgs): Promise<void> {
    return this.queryQR(
      async qr => qr.createSchema(args.schemaName),
      args.databaseName,
    );
  }

  async checkoutDatabase(
    qr: QueryRunner,
    dbName: string,
    refName?: string,
  ): Promise<void> {
    const currentDb = await qr.getCurrentDatabase();
    if (dbName !== currentDb) {
      throw new Error("Databases do not match");
    }
    if (this.isDolt && refName) {
      await qr.query(`SELECT dolt_checkout('${refName}')`);
    }
  }

  async changeSchema(qr: QueryRunner, schemaName: string): Promise<void> {
    await qr.query(qh.setSearchPath(schemaName, this.isDolt));
  }

  async getTableNames(args: t.RefMaybeSchemaArgs): Promise<string[]> {
    return this.queryQR(async qr => {
      const schema = await getSchema(qr, args);
      const res: t.RawRows = await qr.query(qh.listTablesQuery, [schema]);
      return res.map(r => r.tablename);
    }, args.databaseName);
  }

  async getTableInfo(
    args: t.TableMaybeSchemaArgs,
  ): Promise<TableDetails | undefined> {
    return this.queryQR(async qr => {
      const schema = await getSchema(qr, args);
      const table = await qr.getTable(`${schema}.${args.tableName}`);
      if (!table) return undefined;
      return convertToTableDetails(table);
    }, args.databaseName);
  }

  async getTables(
    args: t.RefMaybeSchemaArgs,
    tns: string[],
  ): Promise<TableDetails[]> {
    return this.queryQR(async qr => {
      const schema = await getSchema(qr, args);
      const names = tns.map(tn => `${schema}.${tn}`);
      const tables = await qr.getTables(names);
      return tables.map(convertToTableDetails);
    }, args.databaseName);
  }

  async getTablePKColumns(args: t.TableMaybeSchemaArgs): Promise<string[]> {
    return this.queryQR(async qr => {
      const schema = await getSchema(qr, args);
      const table = await qr.getTable(`${schema}.${args.tableName}`);
      if (!table) return [];
      return table.columns.filter(c => c.isPrimary).map(c => c.name);
    }, args.databaseName);
  }

  async getTableRows(
    args: t.TableMaybeSchemaArgs,
    page: t.TableRowPagination,
  ): t.PR {
    return this.queryQR(async qr => {
      const schema = await getSchema(qr, args);

      const em = qr.manager;
      let build = em
        .createQueryBuilder()
        .select("*")
        .from(`${schema}.${args.tableName}`, args.tableName);

      page.pkCols.forEach(col => {
        build = build.addOrderBy(col, "ASC");
      });

      return build
        .limit(ROW_LIMIT + 1)
        .offset(page.offset)
        .getRawMany();
    }, args.databaseName);
  }

  async getSqlSelect(
    args: t.RefMaybeSchemaArgs & { queryString: string },
  ): t.PR {
    return this.queryQR(
      async qr => {
        if (args.schemaName) {
          await this.changeSchema(qr, args.schemaName);
        }
        return qr.query(args.queryString, []);
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
