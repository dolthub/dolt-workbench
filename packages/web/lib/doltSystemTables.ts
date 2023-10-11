import Maybe from "./Maybe";
import { getTableName } from "./parseSqlQuery";

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

export function isShowViewFragmentQuery(q: string): boolean {
  return q.toLowerCase().startsWith("show create view");
}

export function isDoltDiffTableQuery(q: string): boolean | undefined {
  // This is a workaround until all where clauses work
  const queryWithoutClauses = removeClauses(q);
  const tableName = getTableName(queryWithoutClauses);
  return (
    tableName?.startsWith("dolt_diff_") ||
    tableName?.startsWith("dolt_commit_diff_")
  );
}

export function removeClauses(q: string): string {
  const [beforeWhere] = q.split("WHERE ");
  return beforeWhere;
}
