import { EntityManager } from "typeorm";
import { RawRows } from "../types";
import { DoltCellLookupBuildArgs } from "./buildDoltCellDiff";
import {
  Built,
  SENTINEL_ALIAS,
  buildWhereConditions,
  builtSelect,
  newParamAccumulator,
} from "./buildUtils";

export function buildDoltCellHistory(
  em: EntityManager,
  target: string,
  args: DoltCellLookupBuildArgs,
): Built<RawRows> {
  const escape = em.connection.driver.escape.bind(em.connection.driver);
  const acc = newParamAccumulator();

  const { columnName } = args;
  const includedCols = columnName ? [columnName] : args.columnNames;
  const selectCols = [
    ...includedCols,
    "commit_hash",
    "committer",
    "commit_date",
  ]
    .map(escape)
    .join(", ");

  const qb = em
    .createQueryBuilder()
    .select(selectCols)
    .from(target, SENTINEL_ALIAS)
    .where(buildWhereConditions(args.pkValues, escape, acc), acc.namedParams)
    .orderBy(escape("commit_date"), "DESC");

  return builtSelect(qb, acc, escape);
}
