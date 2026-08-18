import { McpServerConfig } from "./types";

type CommitAuthor = {
  name: string;
  email: string;
};

export function getMcpServerArgs(
  mcpConfig: McpServerConfig,
  commitAuthor?: CommitAuthor,
): string[] {
  if (mcpConfig.type?.toLowerCase() === "sqlite") {
    if (!mcpConfig.databaseFile) {
      throw new Error("DoltLite MCP requires a database file path");
    }
    const args = ["--stdio", "--doltlite", "--db-file", mcpConfig.databaseFile];
    if (commitAuthor) {
      args.push(
        "--commit-name",
        commitAuthor.name,
        "--commit-email",
        commitAuthor.email,
      );
    }
    return args;
  }

  if (!mcpConfig.host || !mcpConfig.port || !mcpConfig.user) {
    throw new Error("Dolt MCP requires a host, port, and user");
  }

  const args = [
    "--stdio",
    "--host",
    mcpConfig.host,
    "--port",
    String(mcpConfig.port),
    "--user",
    mcpConfig.user,
    "--database",
    mcpConfig.database,
    "--password",
    mcpConfig.password ?? "",
  ];

  if (mcpConfig.useSSL) {
    args.push("--tls", "skip-verify");
  }

  if (mcpConfig.type?.toLowerCase() === "postgres") {
    args.push("--doltgres");
  }

  return args;
}
