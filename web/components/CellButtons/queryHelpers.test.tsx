import { getDoltDiffQuery } from "./queryHelpers";
import {
  lpCellDiffQuery,
  lpCellProps,
  lpRowDiffQuery,
  lpRowProps,
  saCellDiffQuery,
  saCellProps,
  saRowDiffQuery,
  saRowProps,
} from "./testData";

describe("query conversions work for cell buttons", () => {
  it("converts table information to dolt_diff query for cell", () => {
    const query = getDoltDiffQuery(lpCellProps);
    expect(query).toBe(lpCellDiffQuery);
  });

  it("converts table information to dolt_diff query for row", () => {
    const query = getDoltDiffQuery(lpRowProps);
    expect(query).toBe(lpRowDiffQuery);
  });

  it("converts table information to dolt_diff query for cell with multiple PKs and PK with timestamp type", () => {
    const query = getDoltDiffQuery(saCellProps);
    expect(query).toBe(saCellDiffQuery);
  });

  it("converts table information to dolt_diff query for row with multiple PKs and PK with timestamp type", () => {
    const query = getDoltDiffQuery(saRowProps);
    expect(query).toBe(saRowDiffQuery);
  });
});
