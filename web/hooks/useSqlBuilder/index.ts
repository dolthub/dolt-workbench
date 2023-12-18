import { ColumnForDataTableFragment, SchemaType } from "@gen/graphql-types";
import useSqlParser from "@hooks/useSqlParser";
import { Alter, Delete, Insert_Replace, Select, Update } from "node-sql-parser";
import {
  ColumnValue,
  Conditions,
  addToExistingWhereFromPKCols,
  escapeSingleQuotes,
  escapeSingleQuotesInWhereObj,
  getOrderByArr,
  getPostgresSchemaDefQuery,
  getSqlAlter,
  getSqlColumn,
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
    const columns = mapColsToColumnRef(cols, !!isJoinClause);

    if (!ast) return "";
    if (!tableNames || tableNames.length === 0) {
      return convertToSqlSelect({
        ...ast,
        columns,
        from: [{ db: null, table: null, as: null }],
        where: escapeSingleQuotesInWhereObj(ast.where, isPostgres),
      });
    }
    const newAst: Select = {
      ...ast,
      columns,
      from: tableNames.map(table => {
        return { db: null, table, as: null };
      }),
      where: escapeSingleQuotesInWhereObj(ast.where, isPostgres),
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
    const columns = mapColsToColumnNames(cols);
    if (!ast) return "";
    const newAst: Select = {
      ...ast,
      columns,
      from: [{ db: null, table: tableNames, as: null }],
      where: escapeSingleQuotesInWhereObj(ast.where, isPostgres),
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
    sel.where = addToExistingWhereFromPKCols(conditions, isPostgres, sel.where);
    return convertToSqlSelect(sel);
  }

  function insertIntoTable(
    tableName: string,
    cols: string[],
    vals: ColumnValue[],
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
                value: escapeSingleQuotes(v.value, isPostgres),
              };
            }
            return v;
          }),
        },
      ],
    });
  }

  function deleteFromTable(tableName: string, cond: Conditions): string {
    return convertToSqlDelete({
      from: [{ table: tableName, db: null, as: null }],
      where: getWhereFromPKCols(cond, isPostgres),
    });
  }

  function getDefaultQueryString(dbName: string): string {
    if (isPostgres) {
      return `SELECT *
FROM pg_catalog.pg_tables
where schemaname='${dbName}';`;
    }
    return "SHOW TABLES;";
  }

  function hideRowQuery(tableName: string, conditions: Conditions): string {
    const whereVals = getWhereFromPKCols(conditions, isPostgres);
    const sel: Partial<Select> = {
      columns: [getSqlColumn("*")],
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
      where: getWhereFromPKCols(conditions, isPostgres),
      set: [
        {
          column: setCol,
          value: {
            type: "single_quote_string",
            value: escapeSingleQuotes(setVal, isPostgres),
          },
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
      where: getWhereFromPKCols(conditions, isPostgres),
      set: [
        { column: setCol, value: { type: "null", value: null }, table: null },
      ],
    });
  }

  function dropTable(tableName: string): string {
    const escapedName = isPostgres ? `"${tableName}"` : `\`${tableName}\``;
    return `DROP TABLE ${escapedName}`;
  }

  function createView(name: string, q: string): string {
    const escapedName = isPostgres ? `"${name}"` : `\`${name}\``;
    return `CREATE VIEW ${escapedName} AS ${q}`;
  }

  function showCreateQuery(
    dbName: string,
    name: string,
    kind: SchemaType,
  ): string {
    return isPostgres
      ? getPostgresSchemaDefQuery(dbName, name, kind)
      : `SHOW CREATE ${kind.toUpperCase()} \`${name}\``;
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
    isPostgres,
    removeColumnFromQuery,
    selectFromTable,
    showCreateQuery,
    updateTableMakeNullQuery,
    updateTableQuery,
  };
}
