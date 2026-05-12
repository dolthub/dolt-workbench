import { EntityManager } from "typeorm";
import { ColumnValue, OrderByClause, PkRow, RawRows } from "../types";
import {
  Built,
  SENTINEL_ALIAS,
  asStringParams,
  buildWhereConditions,
  interpolateForDisplay,
  newParamAccumulator,
  stripSentinelAlias,
} from "./buildUtils";

export type SelectTableRowsBuildArgs = {
  orderBy?: OrderByClause[];
  where?: ColumnValue[];
  excludePks?: PkRow[];
  projection?: string[];
  offset?: number;
  limit: number;
};

export function buildSelectTableRows(
  em: EntityManager,
  target: string,
  args: SelectTableRowsBuildArgs,
): Built<RawRows> {
  const escape = em.connection.driver.escape.bind(em.connection.driver);
  const acc = newParamAccumulator();

  const projection = args.projection?.filter(c => c.length > 0) ?? [];
  const selectClause =
    projection.length > 0 ? projection.map(c => escape(c)).join(", ") : "*";

  let qb = em
    .createQueryBuilder()
    .select(selectClause)
    .from(target, SENTINEL_ALIAS);

  const whereParts: string[] = [];
  if (args.where && args.where.length > 0) {
    whereParts.push(buildWhereConditions(args.where, escape, acc));
  }
  if (args.excludePks && args.excludePks.length > 0) {
    args.excludePks.forEach(pkRow => {
      whereParts.push(
        `NOT (${buildWhereConditions(pkRow.values, escape, acc)})`,
      );
    });
  }
  if (whereParts.length > 0) {
    qb = qb.where(whereParts.join(" AND "), acc.namedParams);
  }

  if (args.orderBy && args.orderBy.length > 0) {
    args.orderBy.forEach((o, i) => {
      const col = escape(o.column);
      if (i === 0) {
        qb = qb.orderBy(col, o.direction);
      } else {
        qb = qb.addOrderBy(col, o.direction);
      }
    });
  }

  const [preLimitSql, preLimitRawParams] = qb.getQueryAndParameters();
  const displaySql = stripSentinelAlias(
    interpolateForDisplay(
      preLimitSql,
      asStringParams(preLimitRawParams),
      acc.paramTypes,
    ),
    escape,
  );

  qb = qb.limit(args.limit);
  if (args.offset !== undefined && args.offset > 0) {
    qb = qb.offset(args.offset);
  }

  const [rawSql, rawParams] = qb.getQueryAndParameters();
  const sql = stripSentinelAlias(rawSql, escape);

  return {
    sql,
    params: asStringParams(rawParams),
    displaySql,
    execute: async () => qb.getRawMany(),
  };
}
