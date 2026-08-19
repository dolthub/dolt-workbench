import { mutationExecutionMessage } from "../build/buildUtils";
import { ClassifiedResult } from "../mysql/classifyResult";
import * as t from "../types";

export type SqliteStructuredResult = {
  raw: t.RawRow[] | number | bigint | null | undefined;
  records?: t.RawRow[];
  affected?: number;
};

export function classifySqliteResult(
  result: SqliteStructuredResult,
): ClassifiedResult {
  const isMutation = result.affected !== undefined;
  if (!isMutation) {
    return {
      rows: result.records ?? [],
      isMutation: false,
      executionMessage: "",
    };
  }
  return {
    rows: [],
    isMutation: true,
    executionMessage: mutationExecutionMessage(result.affected ?? 0),
  };
}
