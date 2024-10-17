import { ColumnForDataTableFragment, SchemaType } from "@gen/graphql-types";
import useSqlParser from "@hooks/useSqlParser";
import {
  Alter,
  Delete,
  Drop,
  Insert_Replace,
  Select,
  Update,
} from "node-sql-parser";
import * as u from "./util";
import { escapeSingleQuotes } from "./util";

export default function useSqlBuilder() {
  const { sqlify, isPostgres, parseSelectQuery, getTableNames } =
    useSqlParser();

  function convertToSqlInsert(ins: Partial<Insert_Replace>): string {
    return sqlify(u.getSqlInsert(ins));
  }

  function convertToSqlDelete(del: Partial<Delete>): string {
    return sqlify(u.getSqlDelete(del));
  }

  function convertToSqlAlter(alt: Partial<Alter>): string {
    return sqlify(u.getSqlAlter(alt));
  }

  function convertToSqlUpdate(upd: Partial<Update>): string {
    return sqlify(u.getSqlUpdate(upd));
  }

  function convertToSqlSelect(select: Partial<Select>): string {
    return sqlify(u.getSqlSelect(select));
  }

  // Converts query string to sql with new table name and columns
  function convertToSqlWithNewCols(
    q: string,
    cols: ColumnForDataTableFragment[] | "*",
    tableNames?: string[],
  ): string {
    const ast = parseSelectQuery(q);
    const isJoinClause = tableNames && tableNames.length > 1;
    const columns = u.mapColsToColumnRef(cols, !!isJoinClause);

    if (!ast) return "";
    if (!tableNames || tableNames.length === 0) {
      return convertToSqlSelect({
        ...ast,
        columns,
        from: u.getSqlFromTable(null),
        where: u.escapeSingleQuotesInWhereObj(ast.where, isPostgres),
      });
    }
    const newAst: Select = {
      ...ast,
      columns,
      from: tableNames.map(table => u.getSqlTable(table)),
      where: u.escapeSingleQuotesInWhereObj(ast.where, isPostgres),
    };
    return convertToSqlSelect(newAst);
  }

  // Converts query string to sql with new table name and columns
  function convertToSqlWithNewColNames(
    q: string,
    cols: string[] | "*",
    tableNames: string,
  ): string {
    const ast = parseSelectQuery(q);
    const columns = u.mapColsToColumnNames(cols);
    if (!ast) return "";
    const newAst: Select = {
      ...ast,
      columns,
      from: u.getSqlFromTable(tableNames),
      where: u.escapeSingleQuotesInWhereObj(ast.where, isPostgres),
    };
    return convertToSqlSelect(newAst);
  }

  // Adds order by clause to query string
  function convertToSqlWithOrderBy(
    query: string,
    column: string,
    type?: "ASC" | "DESC",
  ): string {
    const parsed = parseSelectQuery(query);
    if (!parsed) {
      return query;
    }
    const orderby = u.getOrderByArr(parsed, column, type);
    return convertToSqlSelect({ ...parsed, orderby });
  }

  // Removes a column from a select query
  function removeColumnFromQuery(
    q: string,
    colNameToRemove: string,
    cols: ColumnForDataTableFragment[],
  ): string {
    const newCols = cols.filter(c => c.name !== colNameToRemove);
    const tableNames = getTableNames(q);
    return convertToSqlWithNewCols(q, newCols, tableNames);
  }

  function selectFromTable(tableName: string, limit?: number): string {
    return convertToSqlSelect({
      from: u.getSqlFromTable(tableName),
      limit: limit ? u.getSqlLimit(limit) : null,
    });
  }

  function addWhereClauseToSelect(
    tableName: string,
    conditions: u.Conditions,
    q?: string,
  ): string {
    let sel: Partial<Select> = { from: u.getSqlFromTable(tableName) };
    if (q) {
      const parsed = parseSelectQuery(q);
      if (parsed !== null) {
        sel = parsed;
      }
    }
    sel.where = u.addToExistingWhereFromPKCols(
      conditions,
      isPostgres,
      sel.where,
    );
    return convertToSqlSelect(sel);
  }

  function insertIntoTable(
    tableName: string,
    cols: string[],
    vals: u.ColumnValue[],
  ): string {
    return convertToSqlInsert({
      table: [{ table: tableName }],
      columns: cols,
      values: [
        {
          type: "expr_list",
          value: vals.map(v => {
            if (v.type === "single_quote_string") {
              return {
                type: v.type,
                value: u.escapeSingleQuotes(v.value, isPostgres),
              };
            }
            return v;
          }),
        },
      ],
    });
  }

  function deleteFromTable(tableName: string, cond: u.Conditions): string {
    return convertToSqlDelete({
      from: [{ table: tableName, db: null, as: null }],
      where: u.getWhereAndFromConditions(cond, isPostgres),
    });
  }

  function getDefaultQueryString(schemaName?: string): string {
    if (isPostgres) {
      return `SELECT *
FROM pg_catalog.pg_tables
where schemaname='${schemaName ?? "public"}';`;
    }
    return "SHOW TABLES;";
  }

  function hideRowQuery(tableName: string, conditions: u.Conditions): string {
    const whereVals = u.getWhereAndFromConditions(conditions, isPostgres);
    const sel: Partial<Select> = {
      columns: [u.getSqlColumn("*")],
      type: "select",
      from: [{ table: tableName }],
    };
    if (whereVals) {
      sel.where = {
        name: "NOT",
        type: "function",
        args: {
          type: "expr_list",
          value: [whereVals],
        },
      };
    }
    return convertToSqlSelect(sel);
  }

  function alterTableDropColQuery(tableName: string, column: string): string {
    const alt = {
      table: [{ table: tableName, db: null, as: null }],
      expr: [
        {
          action: "drop",
          column: u.getSqlColumnRef(column),
          keyword: "COLUMN",
          resource: "column",
          type: "alter",
        },
      ],
    };
    return convertToSqlAlter(alt);
  }

  function updateTableQuery(
    tableName: string,
    setCol: string,
    setVal: string,
    conditions: u.Conditions,
  ): string {
    return convertToSqlUpdate({
      table: [{ table: tableName, db: null, as: null }],
      where: u.getWhereAndFromConditions(conditions, isPostgres),
      set: [
        {
          column: setCol,
          value: {
            type: "single_quote_string",
            value: u.escapeSingleQuotes(setVal, isPostgres),
          },
          table: null,
        },
      ],
    });
  }

  function updateTableMakeNullQuery(
    tableName: string,
    setCol: string,
    conditions: u.Conditions,
  ): string {
    return convertToSqlUpdate({
      table: [{ table: tableName, db: null, as: null }],
      where: u.getWhereAndFromConditions(conditions, isPostgres),
      set: [
        { column: setCol, value: { type: "null", value: null }, table: null },
      ],
    });
  }

  function dropTable(tableName: string): string {
    const drop: Drop = {
      type: "drop",
      keyword: "table",
      name: [{ db: null, table: tableName, as: null }],
    };
    return sqlify(drop);
  }

  function createView(name: string, q: string): string {
    const escapedName = isPostgres ? `"${name}"` : `\`${name}\``;
    return `CREATE VIEW ${escapedName} AS ${q}`;
  }

  function showCreateQuery(
    name: string,
    kind: SchemaType,
    dbName?: string,
    schemaName?: string,
  ): string {
    return isPostgres
      ? u.getPostgresSchemaDefQuery(name, kind, dbName, schemaName)
      : `SHOW CREATE ${kind.toUpperCase()} \`${name}\``;
  }

  function getCallProcedure(name: string, args: string[]): string {
    const quotedArgs = args
      .map(a => `'${escapeSingleQuotes(a, isPostgres)}'`)
      .join(", ");
    return `${isPostgres ? "SELECT" : "CALL"} ${name}(${quotedArgs});`;
  }

  return {
    addWhereClauseToSelect,
    alterTableDropColQuery,
    convertToSqlSelect,
    convertToSqlWithNewCols,
    convertToSqlWithNewColNames,
    convertToSqlWithOrderBy,
    createView,
    deleteFromTable,
    dropTable,
    getCallProcedure,
    getDefaultQueryString,
    hideRowQuery,
    insertIntoTable,
    isPostgres,
    removeColumnFromQuery,
    selectFromTable,
    showCreateQuery,
    updateTableMakeNullQuery,
    updateTableQuery,
  };
}
