import { ReturnType } from "../types";
import { useGetDoltHistoryQuery } from "../useGetDoltHistoryQuery";
import { renderHookForMaybePostgres } from "./renderHookForMaybePostgres.test";
import * as td from "./testDataDiff";
import * as T from "./types";

type Tests = Array<
  Omit<T.Test<string>, "args"> & { args: (isPG: boolean) => string }
>;

async function renderUseGetDoltHistoryQuery(
  q: string,
  isPostgres = false,
): Promise<ReturnType> {
  return renderHookForMaybePostgres(q, useGetDoltHistoryQuery, isPostgres);
}

const tests: Tests = [
  {
    desc: "cell",
    args: td.getLpCellDiffQuery,
    expected: td.getLpCellHistoryQuery,
  },
  {
    desc: "row",
    args: td.getLpRowDiffQuery,
    expected: td.getLpRowHistoryQuery,
  },
  {
    desc: "cell with multiple PKs",
    args: td.getSaCellDiffQuery,
    expected: td.getSaCellHistoryQuery,
  },
  {
    desc: "row with multiple PKs",
    args: td.getSaRowDiffQuery,
    expected: td.getSaRowHistoryQuery,
  },
  {
    desc: "commit diff",
    args: td.getSaDiffForCommitsQuery,
    expected: td.getSaDiffHistoryQuery,
  },
  {
    desc: "commit diff with where and order by clause",
    args: td.getSaDiffForCommitsWithClausesQuery,
    expected: td.getSaDiffHistoryWithClausesQuery,
  },
  {
    desc: "commit diff for commits",
    args: td.getSaCommitDiffForCommitsQuery,
    expected: td.getSaDiffHistoryQuery,
  },
];

function executeTests(isPG = false) {
  tests.forEach(test => {
    it(`[${isPG ? "postgres" : "mysql"}] converts dolt_diff query to dolt_history query for ${test.desc}`, async () => {
      const { generateQuery } = await renderUseGetDoltHistoryQuery(
        test.args(isPG),
        isPG,
      );
      expect(generateQuery()).toBe(test.expected(isPG));
    });
  });
}

describe("test useGetDoltHistoryQuery", () => {
  // MySQL
  executeTests();
  // Postgres
  executeTests(true);
});
