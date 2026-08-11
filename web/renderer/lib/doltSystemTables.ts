import { Maybe } from "@dolthub/web-utils";

export function isDoltSystemTable(t: Maybe<string>): boolean {
  return !!t?.startsWith("dolt_");
}

const editableSystemTables = [
  "dolt_query_catalog",
  "dolt_branches",
  "dolt_docs",
  "dolt_tests",
];

export function isUneditableDoltSystemTable(t: Maybe<string>): boolean {
  if (!t || !isDoltSystemTable(t)) return false;
  return !editableSystemTables.includes(t);
}
