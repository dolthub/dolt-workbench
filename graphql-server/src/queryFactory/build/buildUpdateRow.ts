import { EntityManager, UpdateResult } from "typeorm";
import { ColumnValue } from "../types";
import {
  Built,
  buildColumnValueMap,
  buildWhereConditions,
  interpolateForDisplay,
  newParamAccumulator,
} from "./buildUtils";

export function buildUpdateRow(
  em: EntityManager,
  target: string,
  set: ColumnValue[],
  where: ColumnValue[],
): Built<UpdateResult> {
  if (set.length === 0) {
    throw new Error("updateRow requires at least one set clause");
  }
  if (where.length === 0) {
    throw new Error("updateRow requires at least one where clause");
  }

  const escape = em.connection.driver.escape.bind(em.connection.driver);
  const acc = newParamAccumulator();
  const setMap = buildColumnValueMap(set, acc);
  const conditions = buildWhereConditions(where, escape, acc);

  const qb = em
    .createQueryBuilder()
    .update(target)
    .set(setMap)
    .where(conditions, acc.namedParams);

  const [sql, params] = qb.getQueryAndParameters() as [string, string[]];
  const displaySql = interpolateForDisplay(sql, params, acc.paramTypes);

  return { sql, params, displaySql, execute: async () => qb.execute() };
}
