import { useSqlEditorContext } from "@contexts/sqleditor";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { isDoltSystemTable } from "@lib/doltSystemTables";
import { OptionalRefParams } from "@lib/params";
import { useCallback, useEffect } from "react";

export const DEFAULT_LIMIT = 1000;
const exampleCreateTable = `CREATE TABLE tablename (pk INT, col1 VARCHAR(255), PRIMARY KEY (pk));`;

export type Params = OptionalRefParams & {
  q?: string;
  tableName?: string;
};

export function useSqlStrings(
  params: Params,
  empty = false,
): { sqlString: string; editorString: string } {
  const { getDefaultQueryString, selectFromTable } = useSqlBuilder();
  const { editorString, setEditorString } = useSqlEditorContext();
  const defaultQuery = getDefaultQueryString(params.databaseName);

  const getSqlString = (): string => {
    if (empty) {
      return exampleCreateTable;
    }
    if (!params.q && !params.tableName) return defaultQuery;
    return (params.q || selectFromTable(params.tableName ?? "")).replace(
      /\r\n|\n|\r/gm,
      " ",
    );
  };

  const getEditorString = useCallback((): string => {
    if (empty) {
      return sampleCreateQueryForEmpty();
    }
    if (params.q) return params.q;
    if (!params.tableName || isDoltSystemTable(params.tableName)) {
      return addEmptyLines([defaultQuery]);
    }
    return addEmptyLines([selectFromTable(params.tableName, DEFAULT_LIMIT)]);
  }, []);

  useEffect(() => {
    const sqlQuery = getEditorString();
    setEditorString(sqlQuery);
  }, [params.q, params.tableName, empty, getEditorString]);

  return { sqlString: getSqlString(), editorString };
}

function addEmptyLines(lines: string[]): string {
  // eslint-disable-next-line no-empty
  while (lines.push("") < 5) {}
  return lines.join("\n");
}

export function sampleCreateQueryForEmpty(): string {
  const lines = [
    "CREATE TABLE tablename (",
    "  pk INT,",
    "  col1 VARCHAR(255),",
    "  PRIMARY KEY (pk)",
    ");",
  ];

  return addEmptyLines(lines);
}
