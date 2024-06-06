import { MockedProvider } from "@apollo/client/testing";
import {
  lpCellDiffQuery,
  lpCellHistoryQuery,
  lpRowDiffQuery,
  lpRowHistoryQuery,
  saCellDiffQuery,
  saCellHistoryQuery,
  saCommitDiffForCommitsQuery,
  saDiffForCommitsQuery,
  saDiffForCommitsWithClausesQuery,
  saDiffHistoryQuery,
  saDiffHistoryWithClausesQuery,
  saRowDiffQuery,
  saRowHistoryQuery,
} from "@components/CellButtons/testData";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { useGetDoltHistoryQuery } from "./useGetDoltHistoryQuery";

function renderUseGetDoltHistoryQuery(q: string): () => string {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[databaseDetailsMock(true, true, false)]}>
      {children}
    </MockedProvider>
  );

  const { result } = renderHook(() => useGetDoltHistoryQuery(q), { wrapper });
  return result.current;
}

const tests: Array<{ query: string; expected: string; desc: string }> = [
  { desc: "cell", query: lpCellDiffQuery, expected: lpCellHistoryQuery },
  { desc: "row", query: lpRowDiffQuery, expected: lpRowHistoryQuery },
  {
    desc: "cell with multiple PKs",
    query: saCellDiffQuery,
    expected: saCellHistoryQuery,
  },
  {
    desc: "row with multiple PKs",
    query: saRowDiffQuery,
    expected: saRowHistoryQuery,
  },
  {
    desc: "commit diff",
    query: saDiffForCommitsQuery,
    expected: saDiffHistoryQuery,
  },
  {
    desc: "commit diff with where and order by clause",
    query: saDiffForCommitsWithClausesQuery,
    expected: saDiffHistoryWithClausesQuery,
  },
  {
    desc: "commit diff for commits",
    query: saCommitDiffForCommitsQuery,
    expected: saDiffHistoryQuery,
  },
];

describe("query conversions work for history table", () => {
  tests.forEach(({ desc, query, expected }) => {
    it(`converts dolt_diff query to dolt_history query for ${desc}`, () => {
      const generateQuery = renderUseGetDoltHistoryQuery(query);
      expect(generateQuery()).toBe(expected);
    });
  });
});
