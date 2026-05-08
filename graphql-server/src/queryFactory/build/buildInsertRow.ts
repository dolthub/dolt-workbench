import { EntityManager, InsertResult } from "typeorm";
import { ColumnValue } from "../types";
import {
  Built,
  buildColumnValueMap,
  interpolateForDisplay,
  newParamAccumulator,
} from "./buildUtils";

export function buildInsertRow(
  em: EntityManager,
  target: string,
  values: ColumnValue[],
): Built<InsertResult> {
  if (values.length === 0) {
    throw new Error("insertRow requires at least one column value");
  }

  const acc = newParamAccumulator();
  const colValues = buildColumnValueMap(values, acc);

  const qb = em
    .createQueryBuilder()
    .insert()
    .into(target)
    .values(colValues)
    .setParameters(acc.namedParams);

  const [sql, params] = qb.getQueryAndParameters() as [string, string[]];
  const displaySql = interpolateForDisplay(sql, params, acc.paramTypes);

  return { sql, params, displaySql, execute: async () => qb.execute() };
}
