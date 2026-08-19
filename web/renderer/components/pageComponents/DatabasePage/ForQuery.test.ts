import { defaultQuery } from "./ForQuery";

describe("defaultQuery", () => {
  it("uses SHOW TABLES for server databases", () => {
    expect(defaultQuery(false)).toBe("SHOW TABLES");
  });

  it("lists user tables and views through sqlite_master for SQLite", () => {
    expect(defaultQuery(true)).toContain("FROM sqlite_master");
    expect(defaultQuery(true)).toContain("type IN ('table', 'view')");
    expect(defaultQuery(true)).toContain("name NOT LIKE 'sqlite_%'");
  });
});
