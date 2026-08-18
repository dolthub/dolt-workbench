import { getMcpServerArgs } from "../../main/agent/mcpServerArgs";

describe("Dolt MCP server arguments", () => {
  it("starts DoltLite against its database file", () => {
    expect(
      getMcpServerArgs(
        {
          database: "payroll",
          databaseFile: "/Users/me/payroll.db",
          type: "Sqlite",
          isDolt: true,
        },
        { name: "Ada", email: "ada@example.com" },
      ),
    ).toEqual([
      "--stdio",
      "--doltlite",
      "--db-file",
      "/Users/me/payroll.db",
      "--commit-name",
      "Ada",
      "--commit-email",
      "ada@example.com",
    ]);
  });

  it("keeps server connection arguments for Doltgres", () => {
    expect(
      getMcpServerArgs({
        host: "localhost",
        port: 5432,
        user: "postgres",
        password: "password",
        database: "payroll",
        useSSL: true,
        type: "Postgres",
        isDolt: true,
      }),
    ).toEqual([
      "--stdio",
      "--host",
      "localhost",
      "--port",
      "5432",
      "--user",
      "postgres",
      "--database",
      "payroll",
      "--password",
      "password",
      "--tls",
      "skip-verify",
      "--doltgres",
    ]);
  });
});
