import { DataTableContext, DataTableContextType } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { DatabasePageParams } from "@lib/params";
import { useCallback, useContext, useEffect } from "react";

const exampleCreateTable = `CREATE TABLE tablename (pk INT, col1 VARCHAR(255), PRIMARY KEY (pk));`;

export function useSqlStrings(
  params: DatabasePageParams,
  empty = false,
): { sqlString: string; editorString: string } {
  const { editorString, setEditorString } = useSqlEditorContext();
  const executedQueryString = (
    useContext(DataTableContext) as DataTableContextType | undefined
  )?.executedQueryString;

  const flattenNewLines = (query: string) =>
    query.replaceAll(/\r\n|\n|\r/gm, " ");

  const getSqlString = (): string => {
    if (empty) return exampleCreateTable;
    if (editorString) return flattenNewLines(editorString);
    return flattenNewLines(params.q || executedQueryString || "");
  };

  const getEditorString = useCallback((): string => {
    if (empty) return sampleCreateQueryForEmpty();
    if (params.q) return params.q;
    if (executedQueryString) return addEmptyLines([executedQueryString]);
    return addEmptyLines([]);
  }, [params.q, empty, executedQueryString]);

  useEffect(() => {
    const sqlQuery = getEditorString();
    setEditorString(sqlQuery);
  }, [getEditorString]);

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
