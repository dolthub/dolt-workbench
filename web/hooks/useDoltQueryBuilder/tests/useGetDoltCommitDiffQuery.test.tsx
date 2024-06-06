import { ReturnType } from "../types";
import { Props, useGetDoltCommitDiffQuery } from "../useGetDoltCommitDiffQuery";
import { renderHookForMaybePostgres } from "./renderHookForMaybePostgres.test";
import {
  noDiffTagsAndRemovedColsExpected,
  noDiffTagsAndRemovedColsForPullExpected,
  noDiffTagsAndRemovedColsForPullProps,
  noDiffTagsAndRemovedColsProps,
  noDiffTagsOrRemovedColsExpected,
  noDiffTagsOrRemovedColsProps,
} from "./testDataCommitDiff";
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
    args: noDiffTagsOrRemovedColsProps,
    expected: noDiffTagsOrRemovedColsExpected,
  },
  {
    desc: "no diff tags and removed columns",
    args: noDiffTagsAndRemovedColsProps,
    expected: noDiffTagsAndRemovedColsExpected,
  },
  {
    desc: "no diff tags and removed columns for pull",
    args: noDiffTagsAndRemovedColsForPullProps,
    expected: noDiffTagsAndRemovedColsForPullExpected,
  },
];

describe("test getDoltCommitDiffQuery for diff tables", () => {
  tests.forEach(({ desc, args, expected }) => {
    it(`[mysql] generates dolt_commit_diff query for ${desc}`, async () => {
      const { generateQuery } = await renderUseGetDoltCommitDiffQuery(args);
      expect(generateQuery()).toBe(expected);
    });
  });
});
