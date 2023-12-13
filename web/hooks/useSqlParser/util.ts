// Uses regex to match table names in query "SELECT [columns] FROM [tableName] ..."
// does not work on more than 2 tables. but better than just extract 1 table
export function fallbackGetTableNamesForSelect(query: string): string[] {
  const tableNameRegex =
    /\b(?:from|join)\s+`?(\w+)`?(?:\s*(?:join|,)\s+`?(\w+)`?)*\b/gi;
  const matches = [...query.matchAll(tableNameRegex)];
  const tableNames = matches.flatMap(match => match.slice(1).filter(Boolean));
  return tableNames;
}
