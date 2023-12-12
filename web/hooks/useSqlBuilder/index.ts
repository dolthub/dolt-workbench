import { ColumnForDataTableFragment } from "@gen/graphql-types";
import useSqlParser from "@hooks/useSqlParser";
import {
  AST,
  Alter,
  Delete,
  Insert_Replace,
  Select,
  Update,
} from "node-sql-parser";
import {
  Conditions,
  escapeSingleQuotesInWhereObj,
  getOrderByArr,
  getSqlAlter,
  getSqlDelete,
  getSqlInsert,
  getSqlSelect,
  getSqlUpdate,
  getWhereFromPKCols,
  mapColsToColumnNames,
  mapColsToColumnRef,
} from "./util";

export default function useSqlBuilder() {
  const { sqlify, isPostgres, parseSelectQuery, getTableNames } =
    useSqlParser();

  function convertToSqlInsert(ins: Partial<Insert_Replace>): string {
    return sqlify(getSqlInsert(ins));
  }

  function convertToSqlDelete(del: Partial<Delete>): string {
    return sqlify(getSqlDelete(del));
  }

  function convertToSqlAlter(alt: Partial<Alter>): string {
    return sqlify(getSqlAlter(alt));
  }

  function convertToSqlUpdate(upd: Partial<Update>): string {
    return sqlify(getSqlUpdate(upd));
  }

  function convertToSqlSelect(select: Partial<Select>): string {
    return sqlify(getSqlSelect(select));
  }

  // Converts query string to sql with new table name and columns
  function convertToSqlWithNewCols(
    q: string,
    cols: ColumnForDataTableFragment[] | "*",
    tableNames?: string[],
  ): string {
    const ast = parseSelectQuery(q);
    const isJoinClause = tableNames && tableNames.length > 1;
    const columns =
      cols === "*" ? cols : mapColsToColumnRef(cols, !!isJoinClause);

    if (!ast) return "";
    if (!tableNames || tableNames.length === 0) {
      return convertToSqlSelect({
        ...ast,
        columns,
        from: [{ db: null, table: null, as: null }],
        where: escapeSingleQuotesInWhereObj(ast.where),
      });
    }
    const newAst: Select = {
      ...ast,
      columns,
      from: tableNames.map(table => {
        return { db: null, table, as: null };
      }),
      where: escapeSingleQuotesInWhereObj(ast.where),
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
    const columns = cols === "*" ? cols : mapColsToColumnNames(cols);
    if (!ast) return "";
    const newAst: Select = {
      ...ast,
      columns,
      from: [{ db: null, table: tableNames, as: null }],
      where: escapeSingleQuotesInWhereObj(ast.where),
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
    const orderby = getOrderByArr(parsed, column, type);
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
      from: [{ table: tableName }],
      limit: limit
        ? { seperator: "", value: [{ type: "number", value: limit }] }
        : null,
    });
  }

  function addWhereClauseToSelect(
    tableName: string,
    conditions: Conditions,
    q?: string,
  ): string {
    let sel: Partial<Select> = { from: [{ table: tableName }] };
    if (q) {
      const parsed = parseSelectQuery(q);
      if (parsed !== null) {
        sel = parsed;
      }
    }
    sel.where = getWhereFromPKCols(conditions, sel.where);
    return convertToSqlSelect(sel);
  }

  function insertIntoTable(
    tableName: string,
    cols: string[],
    vals: Array<{ type: string; value: any }>,
  ): string {
    return convertToSqlInsert({
      table: [{ table: tableName }],
      columns: cols,
      values: [{ type: "expr_list", value: vals }],
    });
  }

  function deleteFromTable(tableName: string, cond: Conditions): string {
    return convertToSqlDelete({
      from: [{ table: tableName, db: null, as: null }],
      where: getWhereFromPKCols(cond),
    });
  }

  function getDefaultQueryString(dbName: string): string {
    if (isPostgres) {
      return `SELECT *
FROM pg_catalog.pg_tables
where schemaname='${dbName}'`;
    }
    return "SHOW TABLES";
  }

  function hideRowQuery(tableName: string, conditions: Conditions): string {
    return convertToSqlSelect({
      columns: "*",
      type: "select",
      from: [{ table: tableName }],
      where: {
        name: "NOT",
        type: "function",
        args: { type: "expr_list", value: [getWhereFromPKCols(conditions)] },
      },
    });
  }

  function alterTableDropColQuery(tableName: string, column: string): string {
    const alt = {
      type: "alter",
      // TODO: Alter type is wrong
      table: [{ table: tableName, db: null, as: null }],
      expr: [
        {
          action: "drop",
          column: { type: "column_ref", table: null, column },
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
    conditions: Conditions,
  ): string {
    return convertToSqlUpdate({
      table: [{ table: tableName, db: null, as: null }],
      where: getWhereFromPKCols(conditions),
      set: [
        {
          column: setCol,
          value: { type: "single_quote_string", value: setVal },
          table: null,
        },
      ],
    });
  }

  function updateTableMakeNullQuery(
    tableName: string,
    setCol: string,
    conditions: Conditions,
  ): string {
    return convertToSqlUpdate({
      table: [{ table: tableName, db: null, as: null }],
      where: getWhereFromPKCols(conditions),
      set: [
        { column: setCol, value: { type: "null", value: null }, table: null },
      ],
    });
  }

  function dropTable(tableName: string): string {
    const drop: AST = {
      // TODO: Drop type
      type: "drop",
      keyword: "table",
      name: [{ db: null, table: tableName, as: null }],
    };
    return sqlify(drop);
  }

  function createView(name: string, q: string): string {
    return isPostgres
      ? `CREATE VIEW "${name}" AS ${q}`
      : `CREATE VIEW \`${name}\` AS ${q}`;
  }

  return {
    addWhereClauseToSelect,
    alterTableDropColQuery,
    convertToSqlWithNewCols,
    convertToSqlWithNewColNames,
    convertToSqlWithOrderBy,
    createView,
    deleteFromTable,
    dropTable,
    getDefaultQueryString,
    hideRowQuery,
    insertIntoTable,
    removeColumnFromQuery,
    selectFromTable,
    updateTableMakeNullQuery,
    updateTableQuery,
  };
}
