import { EntityManager } from "typeorm";
import { CommitDiffType } from "../../diffSummaries/diffSummary.enums";
import {
  BuiltSql,
  SENTINEL_ALIAS,
  bindParam,
  diffSelectClause,
  newParamAccumulator,
  previewSql,
} from "./buildUtils";

export type DoltCommitDiffBuildArgs = {
  fromCommitId: string;
  toCommitId: string;
  columnNames: string[];
  type?: CommitDiffType;
};

export function buildDoltCommitDiff(
  em: EntityManager,
  target: string,
  args: DoltCommitDiffBuildArgs,
): BuiltSql {
  const escape = em.connection.driver.escape.bind(em.connection.driver);
  const acc = newParamAccumulator();

  let qb = em
    .createQueryBuilder()
    .select(diffSelectClause(args.columnNames, escape))
    .from(target, SENTINEL_ALIAS);

  if (args.type === CommitDiffType.ThreeDot) {
    const pTo = bindParam(acc, args.toCommitId);
    const pFrom = bindParam(acc, args.fromCommitId);
    qb = qb.where(
      `${escape("from_commit")} = DOLT_MERGE_BASE(:${pTo}, :${pFrom}) AND ${escape(
        "to_commit",
      )} = HASHOF(:${pFrom})`,
      acc.namedParams,
    );
  } else {
    const pFrom = bindParam(acc, args.fromCommitId);
    const pTo = bindParam(acc, args.toCommitId);
    qb = qb.where(
      `${escape("from_commit")} = :${pFrom} AND ${escape("to_commit")} = :${pTo}`,
      acc.namedParams,
    );
  }

  return previewSql(qb, acc, escape);
}
