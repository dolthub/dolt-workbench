import { ReturnType } from "../types";
import { useGetDoltHistoryQuery } from "../useGetDoltHistoryQuery";
import { renderHookForMaybePostgres } from "./renderHookForMaybePostgres.test";
import * as td from "./testDataDiff";
import { Tests } from "./types";

async function renderUseGetDoltHistoryQuery(
  q: string,
  isPostgres = false,
): Promise<ReturnType> {
  return renderHookForMaybePostgres(q, useGetDoltHistoryQuery, isPostgres);
}

const tests: Tests<string> = [
  {
    desc: "cell",
    args: td.getLpCellDiffQuery(),
    expected: td.lpCellHistoryQuery,
  },
  { desc: "row", args: td.getLpRowDiffQuery(), expected: td.lpRowHistoryQuery },
  {
    desc: "cell with multiple PKs",
    args: td.getSaCellDiffQuery(),
    expected: td.saCellHistoryQuery,
  },
  {
    desc: "row with multiple PKs",
    args: td.getSaRowDiffQuery(),
    expected: td.saRowHistoryQuery,
  },
  {
    desc: "commit diff",
    args: td.saDiffForCommitsQuery,
    expected: td.saDiffHistoryQuery,
  },
  {
    desc: "commit diff with where and order by clause",
    args: td.saDiffForCommitsWithClausesQuery,
    expected: td.saDiffHistoryWithClausesQuery,
  },
  {
    desc: "commit diff for commits",
    args: td.saCommitDiffForCommitsQuery,
    expected: td.saDiffHistoryQuery,
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
