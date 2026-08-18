import { DatabaseType } from "@gen/graphql-types";
import { callProcedure } from "./callProcedure";

describe("callProcedure", () => {
  it("uses CALL and MySQL string escaping for MySQL and Dolt", () => {
    expect(
      callProcedure(DatabaseType.Mysql, "DOLT_CHECKOUT", ["feature's"]),
    ).toBe("CALL DOLT_CHECKOUT('feature\\'s');");
  });

  it.each([DatabaseType.Postgres, DatabaseType.Sqlite])(
    "uses SELECT and standard string escaping for %s",
    databaseType => {
      expect(callProcedure(databaseType, "DOLT_CHECKOUT", ["feature's"])).toBe(
        "SELECT DOLT_CHECKOUT('feature''s');",
      );
    },
  );
});
