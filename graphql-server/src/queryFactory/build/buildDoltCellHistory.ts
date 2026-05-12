import { EntityManager } from "typeorm";
import { DoltCellLookupBuildArgs } from "./buildDoltCellDiff";
import {
  BuiltSql,
  SENTINEL_ALIAS,
  buildWhereConditions,
  newParamAccumulator,
  previewSql,
} from "./buildUtils";

export function buildDoltCellHistory(
  em: EntityManager,
  target: string,
  args: DoltCellLookupBuildArgs,
): BuiltSql {
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

  return previewSql(qb, acc, escape);
}
