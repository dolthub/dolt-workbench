import { DatabaseType } from "@gen/graphql-types";

export function callProcedure(
  databaseType: DatabaseType | undefined,
  name: string,
  args: string[],
): string {
  const usesFunctionSyntax =
    databaseType === DatabaseType.Postgres ||
    databaseType === DatabaseType.Sqlite;
  const quote = usesFunctionSyntax
    ? (s: string) => s.replace(/'/g, "''")
    : (s: string) => s.replace(/'/g, "\\'");
  const quotedArgs = args.map(a => `'${quote(a)}'`).join(", ");
  return `${usesFunctionSyntax ? "SELECT" : "CALL"} ${name}(${quotedArgs});`;
}
