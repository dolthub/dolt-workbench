import { EntityManager } from "typeorm";
import { ColumnValue, RawRows } from "../types";
import {
  Built,
  builtSelect,
  buildWhereConditions,
  newParamAccumulator,
} from "./buildUtils";

export type DoltCellHistoryBuildArgs = {
  pkValues: ColumnValue[];
  columnNames: string[];
  columnName?: string;
};

export function buildDoltCellHistory(
  em: EntityManager,
  target: string,
  args: DoltCellHistoryBuildArgs,
): Built<RawRows> {
  const escape = em.connection.driver.escape.bind(em.connection.driver);
  const acc = newParamAccumulator();

  const cellOnly = args.columnName !== undefined;
  const includedCols = cellOnly
    ? [args.columnName as string]
    : args.columnNames;
  const selectCols = [
    ...includedCols,
    "commit_hash",
    "committer",
    "commit_date",
  ]
    .map(escape)
    .join(", ");

  const alias = target.split(".").pop() ?? target;
  const qb = em
    .createQueryBuilder()
    .select(selectCols)
    .from(target, alias)
    .where(buildWhereConditions(args.pkValues, escape, acc), acc.namedParams)
    .orderBy(escape("commit_date"), "DESC");

  return builtSelect(qb, acc);
}
