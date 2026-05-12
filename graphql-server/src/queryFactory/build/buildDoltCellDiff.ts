import { EntityManager } from "typeorm";
import { ColumnValue } from "../types";
import {
  BuiltSql,
  SENTINEL_ALIAS,
  bindParam,
  diffSelectClause,
  newParamAccumulator,
  ParamAccumulator,
  previewSql,
} from "./buildUtils";

export type DoltCellLookupBuildArgs = {
  pkValues: ColumnValue[];
  columnNames: string[];
  columnName?: string;
};

export function buildDoltCellDiff(
  em: EntityManager,
  target: string,
  args: DoltCellLookupBuildArgs,
): BuiltSql {
  const escape = em.connection.driver.escape.bind(em.connection.driver);
  const acc = newParamAccumulator();

  const { columnName } = args;
  const includedCols = columnName ? [columnName] : args.columnNames;

  let qb = em
    .createQueryBuilder()
    .select(diffSelectClause(includedCols, escape))
    .from(target, SENTINEL_ALIAS);

  const toCond = pkConditions(args.pkValues, "to", escape, acc);
  const fromCond = pkConditions(args.pkValues, "from", escape, acc);
  const pkWhere = `(${toCond}) OR (${fromCond})`;

  let where = pkWhere;
  if (columnName) {
    const fromCol = escape(`from_${columnName}`);
    const toCol = escape(`to_${columnName}`);
    const cellNotEqual = `${fromCol} <> ${toCol} OR (${fromCol} IS NULL AND ${toCol} IS NOT NULL) OR (${fromCol} IS NOT NULL AND ${toCol} IS NULL)`;
    where = `(${pkWhere}) AND (${cellNotEqual})`;
  }

  qb = qb
    .where(where, acc.namedParams)
    .orderBy(escape("to_commit_date"), "DESC");

  return previewSql(qb, acc, escape);
}

function pkConditions(
  pkValues: ColumnValue[],
  prefix: "to" | "from",
  escape: (n: string) => string,
  acc: ParamAccumulator,
): string {
  return pkValues
    .map(pk => {
      const key = bindParam(acc, pk.value ?? "", pk.type);
      return `${escape(`${prefix}_${pk.column}`)} = :${key}`;
    })
    .join(" AND ");
}
