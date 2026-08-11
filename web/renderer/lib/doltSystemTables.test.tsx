import {
  isDoltSystemTable,
  isUneditableDoltSystemTable,
} from "./doltSystemTables";

describe("test doltSystemTables util functions", () => {
  it("checks isDoltSystemTable", () => {
    expect(isDoltSystemTable("dolt_commit_diff_table")).toBeTruthy();
    expect(isDoltSystemTable("dolt_diff_table")).toBeTruthy();
    expect(isDoltSystemTable("dolt_schemas")).toBeTruthy();
    expect(isDoltSystemTable("mytable")).toBeFalsy();
    expect(isDoltSystemTable(undefined)).toBeFalsy();
    expect(isDoltSystemTable("dolttable")).toBeFalsy();
  });

  it("checks isUneditableDoltSystemTable", () => {
    expect(isUneditableDoltSystemTable("dolt_commit_diff_table")).toBeTruthy();
    expect(isUneditableDoltSystemTable("dolt_diff_table")).toBeTruthy();
    expect(isUneditableDoltSystemTable("dolt_branches")).toBeFalsy();
    expect(isUneditableDoltSystemTable("mytable")).toBeFalsy();
    expect(isUneditableDoltSystemTable(undefined)).toBeFalsy();
    expect(isUneditableDoltSystemTable("dolttable")).toBeFalsy();
  });
});
