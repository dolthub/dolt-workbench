import {
  ColumnForDataTableFragment,
  ColumnValueInput,
  OrderByClause,
  PkRow,
  SortDirection,
} from "@gen/graphql-types";
import { NextRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";

export type StackingParams = {
  orderBy?: OrderByClause[];
  where?: ColumnValueInput[];
  excludePks?: PkRow[];
  projection?: string[];
};

const KEYS = {
  orderBy: "orderBy",
  where: "where",
  hide: "hide",
  projection: "projection",
} as const;

const PK_VALUE_DELIM = ",";

function toList(raw: string | string[] | undefined): string[] {
  if (raw === undefined) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.filter(s => s.length > 0);
}

function splitOnce(s: string, sep: string): [string, string] | undefined {
  const i = s.indexOf(sep);
  if (i === -1) return undefined;
  return [s.slice(0, i), s.slice(i + 1)];
}

function decodeOrderBy(s: string): OrderByClause | undefined {
  const parts = splitOnce(s, ".");
  if (!parts) return undefined;
  const [column, rawDir] = parts;
  const dir = rawDir.toLowerCase();
  if (dir === "asc") return { column, direction: SortDirection.Asc };
  if (dir === "desc") return { column, direction: SortDirection.Desc };
  return undefined;
}

function encodeOrderBy(o: OrderByClause): string {
  return `${o.column}.${o.direction.toLowerCase()}`;
}

function decodeWhere(
  s: string,
  typeOf: (col: string) => string | undefined,
): ColumnValueInput | undefined {
  const parts = splitOnce(s, ".");
  if (!parts) return undefined;
  const [column, encoded] = parts;
  return {
    column,
    value: decodeURIComponent(encoded),
    type: typeOf(column),
  };
}

function encodeWhere(w: ColumnValueInput): string {
  return `${w.column}.${encodeURIComponent(w.value ?? "")}`;
}

function decodeHide(
  s: string,
  pkColumns: ColumnForDataTableFragment[],
): PkRow | undefined {
  const values = s.split(PK_VALUE_DELIM).map(decodeURIComponent);
  if (values.length !== pkColumns.length) return undefined;
  return {
    values: pkColumns.map((c, i) => {
      return { column: c.name, value: values[i], type: c.type };
    }),
  };
}

function encodeHide(pkRow: PkRow): string {
  return pkRow.values
    .map(v => encodeURIComponent(v.value ?? ""))
    .join(PK_VALUE_DELIM);
}

function dropEmpty<T>(list: T[]): T[] | undefined {
  return list.length > 0 ? list : undefined;
}

export function parseStackingParams(
  query: ParsedUrlQuery,
  columns: ColumnForDataTableFragment[],
): StackingParams {
  const typeOf = (col: string) => columns.find(c => c.name === col)?.type;
  const pkColumns = columns.filter(c => c.isPrimaryKey);
  return {
    orderBy: dropEmpty(
      toList(query[KEYS.orderBy])
        .map(decodeOrderBy)
        .filter((o): o is OrderByClause => o !== undefined),
    ),
    where: dropEmpty(
      toList(query[KEYS.where])
        .map(s => decodeWhere(s, typeOf))
        .filter((w): w is ColumnValueInput => w !== undefined),
    ),
    excludePks: dropEmpty(
      toList(query[KEYS.hide])
        .map(s => decodeHide(s, pkColumns))
        .filter((p): p is PkRow => p !== undefined),
    ),
    projection: dropEmpty(toList(query[KEYS.projection])),
  };
}

export function stackingParamsToQuery(
  stack: StackingParams,
): Record<string, string[] | undefined> {
  return {
    [KEYS.orderBy]: stack.orderBy?.length
      ? stack.orderBy.map(encodeOrderBy)
      : undefined,
    [KEYS.where]: stack.where?.length
      ? stack.where.map(encodeWhere)
      : undefined,
    [KEYS.hide]: stack.excludePks?.length
      ? stack.excludePks.map(encodeHide)
      : undefined,
    [KEYS.projection]: stack.projection?.length ? stack.projection : undefined,
  };
}

export function setColumnSort(
  current: OrderByClause[] | undefined,
  column: string,
  direction: SortDirection | undefined,
): OrderByClause[] {
  const list = current ?? [];
  if (direction === undefined) return list.filter(o => o.column !== column);
  const existing = list.findIndex(o => o.column === column);
  if (existing === -1) return [...list, { column, direction }];
  const updated = list.slice();
  updated[existing] = { column, direction };
  return updated;
}

export function getColumnSort(
  current: OrderByClause[] | undefined,
  column: string,
): SortDirection | undefined {
  return current?.find(o => o.column === column)?.direction;
}

export function appendWhere(
  current: ColumnValueInput[] | undefined,
  condition: ColumnValueInput,
): ColumnValueInput[] {
  return [...(current ?? []), condition];
}

export function appendExcludePk(
  current: PkRow[] | undefined,
  pkRow: PkRow,
): PkRow[] {
  return [...(current ?? []), pkRow];
}

export function removeFromProjection(
  current: string[] | undefined,
  column: string,
  allColumns: string[],
): string[] {
  const base = current && current.length > 0 ? current : allColumns;
  return base.filter(c => c !== column);
}

export function pushStack(router: NextRouter, stack: StackingParams): void {
  const stackKeys = Object.values(KEYS) as string[];
  const otherParams = Object.fromEntries(
    Object.entries(router.query).filter(([k]) => !stackKeys.includes(k)),
  );
  router
    .push({
      pathname: router.pathname,
      query: {
        ...otherParams,
        ...stackingParamsToQuery(stack),
      },
    })
    .catch(console.error);
}
