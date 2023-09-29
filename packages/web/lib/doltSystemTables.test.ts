import {
  isDoltSystemTable,
  isShowViewFragmentQuery,
  isUneditableDoltSystemTable,
  isDoltDiffTableQuery,
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

  it("checks isShowViewFragmentQuery", () => {
    expect(
      isShowViewFragmentQuery("SHOW CREATE VIEW cases_by_age_range"),
    ).toBeTruthy();
    expect(
      isShowViewFragmentQuery("show create view `cases_by_age_range`"),
    ).toBeTruthy();
    expect(isShowViewFragmentQuery("show view cases")).toBeFalsy();
  });

  it("checks isDoltDiffTableQuery", () => {
    expect(
      isDoltDiffTableQuery("select * from dolt_diff_tablename"),
    ).toBeTruthy();
    expect(
      isDoltDiffTableQuery(
        "select col1, col2 from dolt_diff_newtable where id=2",
      ),
    ).toBeTruthy();
    expect(
      isDoltDiffTableQuery(
        "select col1, col2 from dolt_commit_diff_newtable where id=2",
      ),
    ).toBeTruthy();
    expect(
      isDoltDiffTableQuery("select col1, col2 from dolt_schemas"),
    ).toBeFalsy();
  });
});
