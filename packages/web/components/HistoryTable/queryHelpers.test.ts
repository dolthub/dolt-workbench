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
import { getDoltHistoryQuery } from "./queryHelpers";

describe("query conversions work for history table", () => {
  it("converts dolt_diff query to dolt_history query for cell", () => {
    const query = getDoltHistoryQuery(lpCellDiffQuery);
    expect(query).toBe(lpCellHistoryQuery);
  });

  it("converts dolt_diff query to dolt_history query for row", () => {
    const query = getDoltHistoryQuery(lpRowDiffQuery);
    expect(query).toBe(lpRowHistoryQuery);
  });

  it("converts dolt_diff query to dolt_history query for cell with multiple PKs", () => {
    const query = getDoltHistoryQuery(saCellDiffQuery);
    expect(query).toBe(saCellHistoryQuery);
  });

  it("converts dolt_diff query to dolt_history query for row with multiple PKs", () => {
    const query = getDoltHistoryQuery(saRowDiffQuery);
    expect(query).toBe(saRowHistoryQuery);
  });

  it("converts dolt_diff query for commit diff", () => {
    const query = getDoltHistoryQuery(saDiffForCommitsQuery);
    expect(query).toBe(saDiffHistoryQuery);
  });

  it("converts dolt_diff query for commit diff with another where and order by clause", () => {
    const query = getDoltHistoryQuery(saDiffForCommitsWithClausesQuery);
    expect(query).toBe(saDiffHistoryWithClausesQuery);
  });

  it("converts dolt_commit_diff query for commit diff", () => {
    const query = getDoltHistoryQuery(saCommitDiffForCommitsQuery);
    expect(query).toBe(saDiffHistoryQuery);
  });
});
