import { FieldPacket } from "mysql2";
import { mutationExecutionMessage } from "../build/buildUtils";
import * as t from "../types";

export type MysqlOkPacket = {
  affectedRows?: number;
  info?: string;
};

export type ClassifiedResult = {
  rows: t.RawRows;
  isMutation: boolean;
  executionMessage: string;
  columns?: t.ResultColumn[];
};

export function mapFieldsToColumns(
  fields?: FieldPacket[],
): t.ResultColumn[] | undefined {
  if (!fields || fields.length === 0) return undefined;
  return fields.map(f => {
    return {
      name: f.name,
      sourceTable: f.orgTable || undefined,
    };
  });
}

export function classifyMysqlResult(
  raw: t.RawRows | MysqlOkPacket | null | undefined,
  fields?: FieldPacket[],
): ClassifiedResult {
  if (Array.isArray(raw)) {
    return {
      rows: raw,
      isMutation: false,
      executionMessage: "",
      columns: mapFieldsToColumns(fields),
    };
  }
  const info = raw?.info ?? "";
  const suffix = info.length > 0 ? info.replace("#", " ") : "";
  return {
    rows: [],
    isMutation: true,
    executionMessage: `${mutationExecutionMessage(raw?.affectedRows ?? 0)}${suffix}`,
  };
}
