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

const PRI_KEY_FLAG = 2;

const MYSQL_COLUMN_TYPES: Record<number, string> = {
  0: "decimal",
  1: "tinyint",
  2: "smallint",
  3: "int",
  4: "float",
  5: "double",
  7: "timestamp",
  8: "bigint",
  9: "mediumint",
  10: "date",
  11: "time",
  12: "datetime",
  13: "year",
  15: "varchar",
  16: "bit",
  245: "json",
  246: "decimal",
  247: "enum",
  248: "set",
  249: "tinyblob",
  250: "mediumblob",
  251: "longblob",
  252: "blob",
  253: "varchar",
  254: "char",
  255: "geometry",
};

function isPrimaryKeyField(flags: number | string[]): boolean {
  if (Array.isArray(flags)) return flags.includes("PRI_KEY");
  return (flags & PRI_KEY_FLAG) !== 0;
}

function getFieldTypeName(field: FieldPacket): string {
  if (field.typeName) return field.typeName.toLowerCase();
  const code = field.columnType ?? field.type;
  if (code === undefined) return "unknown";
  return MYSQL_COLUMN_TYPES[code] ?? "unknown";
}

export function mapFieldsToColumns(
  fields?: FieldPacket[],
): t.ResultColumn[] | undefined {
  if (!fields || fields.length === 0) return undefined;
  return fields.map(f => {
    return {
      name: f.name,
      isPrimaryKey: isPrimaryKeyField(f.flags),
      type: getFieldTypeName(f),
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
