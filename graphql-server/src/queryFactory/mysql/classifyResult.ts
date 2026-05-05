import * as t from "../types";

export type MysqlOkPacket = {
  affectedRows?: number;
  info?: string;
};

export type MysqlStructuredResult = {
  raw: t.RawRow[] | MysqlOkPacket | null | undefined;
  records: t.RawRow[];
  affected?: number;
};

export type ClassifiedResult = {
  rows: t.RawRows;
  isMutation: boolean;
  executionMessage: string;
};

function isOkPacket(
  raw: t.RawRow[] | MysqlOkPacket | null | undefined,
): raw is MysqlOkPacket {
  return !!raw && !Array.isArray(raw);
}

export function classifyMysqlResult(
  result: MysqlStructuredResult,
): ClassifiedResult {
  const isMutation = result.affected !== undefined;
  if (!isMutation) {
    return { rows: result.records, isMutation: false, executionMessage: "" };
  }
  const info: string = isOkPacket(result.raw) ? (result.raw.info ?? "") : "";
  return {
    rows: [],
    isMutation: true,
    executionMessage: `Query OK, ${
      result.affected ?? 0
    } rows affected.${info.length > 0 ? info.replace("#", " ") : ""}`,
  };
}
