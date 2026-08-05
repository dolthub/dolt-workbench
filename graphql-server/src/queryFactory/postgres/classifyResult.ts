import { mutationExecutionMessage } from "../build/buildUtils";
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
  const rows = res.rows ?? [];
  if (!isMutation) {
    return { rows, isMutation: false, executionMessage: "" };
  }
  return {
    rows,
    isMutation: true,
    executionMessage: mutationExecutionMessage(res.rowCount ?? 0),
  };
}
