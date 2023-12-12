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
import { useGetDoltHistoryQuery } from "./queryHelpers";

describe("query conversions work for history table", () => {
  it("converts dolt_diff query to dolt_history query for cell", () => {
    const generateQuery = useGetDoltHistoryQuery(lpCellDiffQuery);
    expect(generateQuery()).toBe(lpCellHistoryQuery);
  });

  it("converts dolt_diff query to dolt_history query for row", () => {
    const generateQuery = useGetDoltHistoryQuery(lpRowDiffQuery);
    expect(generateQuery()).toBe(lpRowHistoryQuery);
  });

  it("converts dolt_diff query to dolt_history query for cell with multiple PKs", () => {
    const generateQuery = useGetDoltHistoryQuery(saCellDiffQuery);
    expect(generateQuery()).toBe(saCellHistoryQuery);
  });

  it("converts dolt_diff query to dolt_history query for row with multiple PKs", () => {
    const generateQuery = useGetDoltHistoryQuery(saRowDiffQuery);
    expect(generateQuery()).toBe(saRowHistoryQuery);
  });

  it("converts dolt_diff query for commit diff", () => {
    const generateQuery = useGetDoltHistoryQuery(saDiffForCommitsQuery);
    expect(generateQuery()).toBe(saDiffHistoryQuery);
  });

  it("converts dolt_diff query for commit diff with another where and order by clause", () => {
    const generateQuery = useGetDoltHistoryQuery(
      saDiffForCommitsWithClausesQuery,
    );
    expect(generateQuery()).toBe(saDiffHistoryWithClausesQuery);
  });

  it("converts dolt_commit_diff query for commit diff", () => {
    const generateQuery = useGetDoltHistoryQuery(saCommitDiffForCommitsQuery);
    expect(generateQuery()).toBe(saDiffHistoryQuery);
  });
});
