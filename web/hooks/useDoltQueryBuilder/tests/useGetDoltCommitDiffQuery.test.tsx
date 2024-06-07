import { ReturnType } from "../types";
import { Props, useGetDoltCommitDiffQuery } from "../useGetDoltCommitDiffQuery";
import { renderHookForMaybePostgres } from "./renderHookForMaybePostgres.test";
import * as td from "./testDataCommitDiff";
import { Tests } from "./types";

async function renderUseGetDoltCommitDiffQuery(
  args: Props,
  isPostgres = false,
): Promise<ReturnType> {
  return renderHookForMaybePostgres(
    args,
    useGetDoltCommitDiffQuery,
    isPostgres,
  );
}

const tests: Tests<Props> = [
  {
    desc: "no diff tags or removed columns",
    args: td.noDiffTagsOrRemovedColsProps,
    expected: td.getNoDiffTagsOrRemovedColsExpected,
  },
  {
    desc: "no diff tags and removed columns",
    args: td.noDiffTagsAndRemovedColsProps,
    expected: td.getNoDiffTagsAndRemovedColsExpected,
  },
  {
    desc: "no diff tags and removed columns for pull",
    args: td.noDiffTagsAndRemovedColsForPullProps,
    expected: td.getNoDiffTagsAndRemovedColsForPullExpected,
  },
];

function executeTest(isPG = false) {
  tests.forEach(test => {
    it(`[${isPG ? "postgres" : "mysql"}] generates dolt_commit_diff query for ${test.desc}`, async () => {
      const { generateQuery } = await renderUseGetDoltCommitDiffQuery(
        test.args,
        isPG,
      );
      expect(generateQuery()).toBe(test.expected(isPG));
    });
  });
}

describe("test useGetDoltCommitDiffQuery", () => {
  // MySQL
  executeTest();
  // Postgres
  executeTest(true);
});
