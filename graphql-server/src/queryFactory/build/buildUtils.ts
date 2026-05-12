import { pluralize } from "@dolthub/web-utils";
import { EntityManager, SelectQueryBuilder } from "typeorm";
import { ColumnValue, RawRows } from "../types";

export type BuiltSql = {
  sql: string;
  params: string[];
  displaySql: string;
};

export type Built<TResult> = BuiltSql & {
  execute: () => Promise<TResult>;
};

// TypeORM's SelectQueryBuilder.from(target, alias) requires an alias and emits
// it as `FROM <target> <alias>`. Build helpers pass SENTINEL_ALIAS and call
// stripSentinelAlias on the rendered SQL to drop it.
export const SENTINEL_ALIAS = "__t__";

export function stripSentinelAlias(
  sql: string,
  escape: (name: string) => string,
): string {
  return sql.replace(` ${escape(SENTINEL_ALIAS)}`, "");
}

export function mutationExecutionMessage(rowsAffected: number): string {
  return `Query OK, ${rowsAffected} ${pluralize(rowsAffected, "row")} affected.`;
}

export const DDL_EXECUTION_MESSAGE = "Query OK.";

export function escapeQualifiedIdentifier(
  escape: (name: string) => string,
  qualified: string,
): string {
  return qualified.split(".").map(escape).join(".");
}

export function ddlBuilt(em: EntityManager, sql: string): Built<unknown> {
  return {
    sql,
    params: [],
    displaySql: sql,
    execute: async () => em.query(sql),
  };
}

export function escapeStringLiteral(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

const NUMERIC_TYPE_PREFIXES = [
  "int",
  "bigint",
  "smallint",
  "tinyint",
  "mediumint",
  "decimal",
  "numeric",
  "float",
  "double",
  "real",
];

export function isNumericType(type: string | undefined): boolean {
  if (!type) return false;
  const t = type.toLowerCase();
  return NUMERIC_TYPE_PREFIXES.some(p => t.startsWith(p));
}

const BOOLEAN_TYPE_PREFIXES = ["bool", "boolean"];

export function isBooleanType(type: string | undefined): boolean {
  if (!type) return false;
  const t = type.toLowerCase();
  return BOOLEAN_TYPE_PREFIXES.some(p => t.startsWith(p));
}

export function formatValueLiteral(
  value: string | null,
  type: string | undefined,
): string {
  if (value === null) return "NULL";
  if (isBooleanType(type)) {
    const lower = value.toLowerCase();
    if (lower === "true" || lower === "1") return "TRUE";
    if (lower === "false" || lower === "0") return "FALSE";
  }
  if (isNumericType(type)) return value;
  return escapeStringLiteral(value);
}

const PLACEHOLDER_PATTERN = /\$\d+|\?/g;

export function interpolateForDisplay(
  sql: string,
  params: string[],
  types: Array<{ type?: string }>,
): string {
  let i = 0;
  return sql.replace(PLACEHOLDER_PATTERN, () => {
    const value = params[i];
    const type = types[i]?.type;
    i += 1;
    return formatValueLiteral(value, type);
  });
}

export type ParamAccumulator = {
  namedParams: Record<string, string>;
  paramTypes: ColumnValue[];
  idx: number;
};

export function newParamAccumulator(): ParamAccumulator {
  return { namedParams: {}, paramTypes: [], idx: 0 };
}

export function bindParam(
  acc: ParamAccumulator,
  value: string,
  type?: string,
): string {
  const key = `p${acc.idx}`;
  acc.idx += 1;
  acc.namedParams[key] = value;
  acc.paramTypes.push({ column: "", value, type });
  return key;
}

export function asStringParams(params: unknown[]): string[] {
  return params.map(p => String(p));
}

export function builtSelect(
  qb: SelectQueryBuilder<any>,
  acc: ParamAccumulator,
): Built<RawRows> {
  const [sql, rawParams] = qb.getQueryAndParameters();
  const params = asStringParams(rawParams);
  const displaySql = interpolateForDisplay(sql, params, acc.paramTypes);
  return { sql, params, displaySql, execute: async () => qb.getRawMany() };
}

export function previewSql(
  qb: SelectQueryBuilder<any>,
  acc: ParamAccumulator,
  escape: (name: string) => string,
): BuiltSql {
  const [rawSql, rawParams] = qb.getQueryAndParameters();
  const params = asStringParams(rawParams);
  const sql = stripSentinelAlias(rawSql, escape);
  const displaySql = stripSentinelAlias(
    interpolateForDisplay(rawSql, params, acc.paramTypes),
    escape,
  );
  return { sql, params, displaySql };
}

const DIFF_METADATA_COLS = [
  "from_commit",
  "from_commit_date",
  "to_commit",
  "to_commit_date",
];

export function diffSelectClause(
  columnNames: string[],
  escape: (n: string) => string,
): string {
  const fromTo = columnNames.flatMap(c => [`from_${c}`, `to_${c}`]);
  return ["diff_type", ...fromTo, ...DIFF_METADATA_COLS].map(escape).join(", ");
}

export function buildWhereConditions(
  conditions: ColumnValue[],
  escape: (name: string) => string,
  acc: ParamAccumulator,
): string {
  return conditions
    .map(c => {
      if (c.value === null || c.value === undefined) {
        return `${escape(c.column)} IS NULL`;
      }
      const key = `p${acc.idx}`;
      acc.idx += 1;
      acc.namedParams[key] = c.value;
      acc.paramTypes.push(c);
      return `${escape(c.column)} = :${key}`;
    })
    .join(" AND ");
}

export function buildColumnValueMap(
  values: ColumnValue[],
  acc: ParamAccumulator,
): Record<string, () => string> {
  const map: Record<string, () => string> = {};
  values.forEach(v => {
    if (v.value === null || v.value === undefined) {
      map[v.column] = () => "NULL";
      return;
    }
    const key = `p${acc.idx}`;
    acc.idx += 1;
    acc.namedParams[key] = v.value;
    acc.paramTypes.push(v);
    map[v.column] = () => `:${key}`;
  });
  return map;
}
