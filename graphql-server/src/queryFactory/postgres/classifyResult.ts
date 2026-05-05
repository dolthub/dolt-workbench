import * as t from "../types";

export const PG_READ_COMMANDS: ReadonlySet<string> = new Set([
  "SELECT",
  "SHOW",
  "EXPLAIN",
  "DESCRIBE",
]);

export type PgQueryResult = {
  command?: string;
  rows?: t.RawRow[];
  rowCount?: number | null;
};

export type ClassifiedResult = {
  rows: t.RawRows;
  isMutation: boolean;
  executionMessage: string;
};

export function classifyPgResult(res: PgQueryResult): ClassifiedResult {
  const isMutation = !PG_READ_COMMANDS.has(res.command ?? "");
  if (!isMutation) {
    return { rows: res.rows ?? [], isMutation: false, executionMessage: "" };
  }
  return {
    rows: [],
    isMutation: true,
    executionMessage: `Query OK, ${res.rowCount ?? 0} rows affected.`,
  };
}
