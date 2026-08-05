import { ColumnValueInput } from "@gen/graphql-types";
import { listParam, strParam } from "@lib/queryParams";
import { ParsedUrlQuery } from "querystring";

export type CellHistoryContext = {
  tableName: string;
  schemaName?: string;
  pkValues: ColumnValueInput[];
  columnName?: string;
};

const KEYS = {
  table: "historyTable",
  schema: "historySchema",
  pk: "historyPk",
  cell: "historyCell",
} as const;

export type CellHistoryQuery = {
  [KEYS.table]?: string;
  [KEYS.schema]?: string;
  [KEYS.pk]?: string[];
  [KEYS.cell]?: string;
};

export function encodeCellHistory(ctx: CellHistoryContext): CellHistoryQuery {
  return {
    [KEYS.table]: ctx.tableName,
    [KEYS.schema]: ctx.schemaName,
    [KEYS.pk]: ctx.pkValues.length
      ? ctx.pkValues.map(
          pk =>
            `${encodeURIComponent(pk.column)}:${encodeURIComponent(pk.value ?? "")}`,
        )
      : undefined,
    [KEYS.cell]: ctx.columnName,
  };
}

export function parseCellHistory(
  q: ParsedUrlQuery,
): CellHistoryContext | undefined {
  const tableName = strParam(q[KEYS.table]);
  if (!tableName) return undefined;
  return {
    tableName,
    schemaName: strParam(q[KEYS.schema]),
    pkValues: listParam(q[KEYS.pk]).map(decodePk),
    columnName: strParam(q[KEYS.cell]),
  };
}

function decodePk(s: string): ColumnValueInput {
  const i = s.indexOf(":");
  if (i === -1) return { column: decodeURIComponent(s), value: "" };
  return {
    column: decodeURIComponent(s.slice(0, i)),
    value: decodeURIComponent(s.slice(i + 1)),
  };
}
