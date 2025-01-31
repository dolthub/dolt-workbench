import { Maybe } from "@dolthub/web-utils";
import useSqlParser from "@hooks/useSqlParser";

export function isDoltSystemTable(t: Maybe<string>): boolean {
  return !!t?.startsWith("dolt_");
}

const editableSystemTables = [
  "dolt_query_catalog",
  "dolt_branches",
  "dolt_docs",
];

export function isUneditableDoltSystemTable(t: Maybe<string>): boolean {
  if (!t || !isDoltSystemTable(t)) return false;
  return !editableSystemTables.includes(t);
}

export function isShowSchemaFragmentQuery(q: string): boolean {
  return !!q.match(/show create (view|event|trigger|procedure)/gi);
}

export function useIsDoltDiffTableQuery(
  connectionName: string,
): (q: string) => boolean | undefined {
  const { getTableName } = useSqlParser(connectionName);
  const generate = (q: string) => {
    // This is a workaround until all where clauses work
    const queryWithoutClauses = removeClauses(q);
    const tableName = getTableName(queryWithoutClauses);
    return (
      tableName?.startsWith("dolt_diff_") ||
      tableName?.startsWith("dolt_commit_diff_")
    );
  };
  return generate;
}

export function removeClauses(q: string): string {
  const [beforeWhere] = q.split("WHERE ");
  return beforeWhere;
}
