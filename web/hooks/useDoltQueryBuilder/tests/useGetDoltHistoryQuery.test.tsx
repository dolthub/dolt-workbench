import { ReturnType } from "../types";
import { useGetDoltHistoryQuery } from "../useGetDoltHistoryQuery";
import { renderHookForMaybePostgres } from "./renderHookForMaybePostgres.test";
import {
  getLpCellDiffQuery,
  getLpRowDiffQuery,
  getSaCellDiffQuery,
  getSaRowDiffQuery,
  lpCellHistoryQuery,
  lpRowHistoryQuery,
  saCellHistoryQuery,
  saCommitDiffForCommitsQuery,
  saDiffForCommitsQuery,
  saDiffForCommitsWithClausesQuery,
  saDiffHistoryQuery,
  saDiffHistoryWithClausesQuery,
  saRowHistoryQuery,
} from "./testDataDiff";
import { Tests } from "./types";

async function renderUseGetDoltHistoryQuery(
  q: string,
  isPostgres = false,
): Promise<ReturnType> {
  return renderHookForMaybePostgres(q, useGetDoltHistoryQuery, isPostgres);
}

const tests: Tests<string> = [
  { desc: "cell", args: getLpCellDiffQuery(), expected: lpCellHistoryQuery },
  { desc: "row", args: getLpRowDiffQuery(), expected: lpRowHistoryQuery },
  {
    desc: "cell with multiple PKs",
    args: getSaCellDiffQuery(),
    expected: saCellHistoryQuery,
  },
  {
    desc: "row with multiple PKs",
    args: getSaRowDiffQuery(),
    expected: saRowHistoryQuery,
  },
  {
    desc: "commit diff",
    args: saDiffForCommitsQuery,
    expected: saDiffHistoryQuery,
  },
  {
    desc: "commit diff with where and order by clause",
    args: saDiffForCommitsWithClausesQuery,
    expected: saDiffHistoryWithClausesQuery,
  },
  {
    desc: "commit diff for commits",
    args: saCommitDiffForCommitsQuery,
    expected: saDiffHistoryQuery,
  },
];

describe("query conversions work for history table", () => {
  tests.forEach(({ desc, args, expected }) => {
    it(`converts dolt_diff query to dolt_history query for ${desc}`, async () => {
      const { generateQuery } = await renderUseGetDoltHistoryQuery(args);
      expect(generateQuery()).toBe(expected);
    });
  });
});
