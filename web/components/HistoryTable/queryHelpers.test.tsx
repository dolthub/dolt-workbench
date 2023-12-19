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
import { useGetDoltHistoryQuery } from "./queryHelpers";

function renderUseGetDoltHistoryQuery(q: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[databaseDetailsMock(true, true, false)]}>
      {children}
    </MockedProvider>
  );

  const { result } = renderHook(() => useGetDoltHistoryQuery(q), { wrapper });
  return result.current;
}

describe("query conversions work for history table", () => {
  it("converts dolt_diff query to dolt_history query for cell", () => {
    const generateQuery = renderUseGetDoltHistoryQuery(lpCellDiffQuery);
    expect(generateQuery()).toBe(lpCellHistoryQuery);
  });

  it("converts dolt_diff query to dolt_history query for row", () => {
    const generateQuery = renderUseGetDoltHistoryQuery(lpRowDiffQuery);
    expect(generateQuery()).toBe(lpRowHistoryQuery);
  });

  it("converts dolt_diff query to dolt_history query for cell with multiple PKs", () => {
    const generateQuery = renderUseGetDoltHistoryQuery(saCellDiffQuery);
    expect(generateQuery()).toBe(saCellHistoryQuery);
  });

  it("converts dolt_diff query to dolt_history query for row with multiple PKs", () => {
    const generateQuery = renderUseGetDoltHistoryQuery(saRowDiffQuery);
    expect(generateQuery()).toBe(saRowHistoryQuery);
  });

  it("converts dolt_diff query for commit diff", () => {
    const generateQuery = renderUseGetDoltHistoryQuery(saDiffForCommitsQuery);
    expect(generateQuery()).toBe(saDiffHistoryQuery);
  });

  it("converts dolt_diff query for commit diff with another where and order by clause", () => {
    const generateQuery = renderUseGetDoltHistoryQuery(
      saDiffForCommitsWithClausesQuery,
    );
    expect(generateQuery()).toBe(saDiffHistoryWithClausesQuery);
  });

  it("converts dolt_commit_diff query for commit diff", () => {
    const generateQuery = renderUseGetDoltHistoryQuery(
      saCommitDiffForCommitsQuery,
    );
    expect(generateQuery()).toBe(saDiffHistoryQuery);
  });
});
