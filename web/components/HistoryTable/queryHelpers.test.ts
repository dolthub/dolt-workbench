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
    const query = useGetDoltHistoryQuery(lpCellDiffQuery);
    expect(query).toBe(lpCellHistoryQuery);
  });

  it("converts dolt_diff query to dolt_history query for row", () => {
    const query = useGetDoltHistoryQuery(lpRowDiffQuery);
    expect(query).toBe(lpRowHistoryQuery);
  });

  it("converts dolt_diff query to dolt_history query for cell with multiple PKs", () => {
    const query = useGetDoltHistoryQuery(saCellDiffQuery);
    expect(query).toBe(saCellHistoryQuery);
  });

  it("converts dolt_diff query to dolt_history query for row with multiple PKs", () => {
    const query = useGetDoltHistoryQuery(saRowDiffQuery);
    expect(query).toBe(saRowHistoryQuery);
  });

  it("converts dolt_diff query for commit diff", () => {
    const query = useGetDoltHistoryQuery(saDiffForCommitsQuery);
    expect(query).toBe(saDiffHistoryQuery);
  });

  it("converts dolt_diff query for commit diff with another where and order by clause", () => {
    const query = useGetDoltHistoryQuery(saDiffForCommitsWithClausesQuery);
    expect(query).toBe(saDiffHistoryWithClausesQuery);
  });

  it("converts dolt_commit_diff query for commit diff", () => {
    const query = useGetDoltHistoryQuery(saCommitDiffForCommitsQuery);
    expect(query).toBe(saDiffHistoryQuery);
  });
});
