import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import {
  isDoltSystemTable,
  isShowSchemaFragmentQuery,
  isUneditableDoltSystemTable,
  useIsDoltDiffTableQuery,
} from "./doltSystemTables";

function renderUseIsDoltDiffTableQuery() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[databaseDetailsMock(true, true, false)]}>
      {children}
    </MockedProvider>
  );

  const { result } = renderHook(useIsDoltDiffTableQuery, { wrapper });
  return result.current;
}

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

  it("checks isShowSchemaFragmentQuery", () => {
    expect(
      isShowSchemaFragmentQuery("SHOW CREATE VIEW cases_by_age_range"),
    ).toBeTruthy();
    expect(
      isShowSchemaFragmentQuery("show create view `cases_by_age_range`"),
    ).toBeTruthy();
    expect(
      isShowSchemaFragmentQuery("show create event `cases_by_age_range`"),
    ).toBeTruthy();
    expect(
      isShowSchemaFragmentQuery("show create trigger `cases_by_age_range`"),
    ).toBeTruthy();
    expect(
      isShowSchemaFragmentQuery("show create table `cases_by_age_range`"),
    ).toBeFalsy();
    expect(isShowSchemaFragmentQuery("show view cases")).toBeFalsy();
  });

  it("checks useIsDoltDiffTableQuery", () => {
    const getIsDoltDiffTableQuery = renderUseIsDoltDiffTableQuery();
    expect(
      getIsDoltDiffTableQuery("select * from dolt_diff_tablename"),
    ).toBeTruthy();
    expect(
      getIsDoltDiffTableQuery(
        "select col1, col2 from dolt_diff_newtable where id=2",
      ),
    ).toBeTruthy();
    expect(
      getIsDoltDiffTableQuery(
        "select col1, col2 from dolt_commit_diff_newtable where id=2",
      ),
    ).toBeTruthy();
    expect(
      getIsDoltDiffTableQuery("select col1, col2 from dolt_schemas"),
    ).toBeFalsy();
  });
});
