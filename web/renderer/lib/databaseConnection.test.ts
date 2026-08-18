import { DatabaseType } from "@gen/graphql-types";
import {
  getConnectionDisplayName,
  isSqliteConnection,
} from "./databaseConnection";

describe("database connection display", () => {
  it("uses a SQLite file's basename without its extension", () => {
    const conn = {
      name: "/Users/me/My Databases/payroll.db",
      type: DatabaseType.Sqlite,
    };

    expect(isSqliteConnection(conn)).toBe(true);
    expect(getConnectionDisplayName(conn)).toBe("payroll");
  });

  it("supports Windows SQLite file paths", () => {
    expect(
      getConnectionDisplayName({
        name: "C:\\Users\\me\\payroll.db",
        type: DatabaseType.Sqlite,
      }),
    ).toBe("payroll");
  });

  it("leaves server connection names unchanged", () => {
    const conn = {
      name: "local-dolt",
      type: DatabaseType.Mysql,
    };

    expect(isSqliteConnection(conn)).toBe(false);
    expect(getConnectionDisplayName(conn)).toBe("local-dolt");
  });
});
