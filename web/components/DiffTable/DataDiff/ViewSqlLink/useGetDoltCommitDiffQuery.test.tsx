import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import {
  noDiffTagsAndRemovedColsExpected,
  noDiffTagsAndRemovedColsForPullExpected,
  noDiffTagsAndRemovedColsForPullProps,
  noDiffTagsAndRemovedColsProps,
  noDiffTagsOrRemovedColsExpected,
  noDiffTagsOrRemovedColsProps,
} from "./testData";
import { Props, useGetDoltCommitDiffQuery } from "./useGetDoltCommitDiffQuery";

function renderUseGetDoltCommitDiffQuery(
  props: Props,
  isPostgres = false,
): () => string {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[databaseDetailsMock(true, true, isPostgres)]}>
      {children}
    </MockedProvider>
  );

  const { result } = renderHook(() => useGetDoltCommitDiffQuery(props), {
    wrapper,
  });
  return result.current;
}

const tests: Array<{ desc: string; props: Props; expected: string }> = [
  {
    desc: "no diff tags or removed columns",
    props: noDiffTagsOrRemovedColsProps,
    expected: noDiffTagsOrRemovedColsExpected,
  },
  {
    desc: "no diff tags and removed columns",
    props: noDiffTagsAndRemovedColsProps,
    expected: noDiffTagsAndRemovedColsExpected,
  },
  {
    desc: "no diff tags and removed columns for pull",
    props: noDiffTagsAndRemovedColsForPullProps,
    expected: noDiffTagsAndRemovedColsForPullExpected,
  },
];

describe("test getDoltCommitDiffQuery for diff tables", () => {
  tests.forEach(({ desc, props, expected }) => {
    it(`[mysql] generates dolt_commit_diff query for ${desc}`, () => {
      const generateQuery = renderUseGetDoltCommitDiffQuery(props);
      expect(generateQuery()).toBe(expected);
    });
  });
});
