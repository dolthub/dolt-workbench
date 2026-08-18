import { DatabaseType } from "@gen/graphql-types";
import { getDatabaseType } from ".";

describe("getDatabaseType", () => {
  it("identifies DoltLite and SQLite connections", () => {
    expect(getDatabaseType(DatabaseType.Sqlite, true)).toBe("DoltLite");
    expect(getDatabaseType(DatabaseType.Sqlite, false)).toBe("SQLite");
  });
});
