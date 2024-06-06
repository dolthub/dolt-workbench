import { ReturnType } from "../types";
import { Props, useGetDoltCommitDiffQuery } from "../useGetDoltCommitDiffQuery";
import { renderHookForMaybePostgres } from "./renderHookForMaybePostgres.test";
import * as td from "./testDataCommitDiff";
import { Test, Tests } from "./types";

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

const tests = (isPG = false): Tests<Props> => [
  {
    desc: "no diff tags or removed columns",
    args: td.noDiffTagsOrRemovedColsProps,
    expected: td.getNoDiffTagsOrRemovedColsExpected(isPG),
  },
  {
    desc: "no diff tags and removed columns",
    args: td.noDiffTagsAndRemovedColsProps,
    expected: td.getNoDiffTagsAndRemovedColsExpected(isPG),
  },
  {
    desc: "no diff tags and removed columns for pull",
    args: td.noDiffTagsAndRemovedColsForPullProps,
    expected: td.getNoDiffTagsAndRemovedColsForPullExpected(isPG),
  },
];

function executeTest(test: Test<Props>, isPG = false) {
  it(`[${isPG ? "postgres" : "mysql"}] generates dolt_commit_diff query for ${test.desc}`, async () => {
    const { generateQuery } = await renderUseGetDoltCommitDiffQuery(
      test.args,
      isPG,
    );
    expect(generateQuery()).toBe(test.expected);
  });
}

describe("test getDoltCommitDiffQuery for diff tables", () => {
  // MySQL
  tests().forEach(test => {
    executeTest(test);
  });

  // Postgres
  tests(true).forEach(test => {
    executeTest(test, true);
  });
});
