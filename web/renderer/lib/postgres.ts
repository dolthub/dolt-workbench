export const getPostgresTableName = (tableName: string): string => {
  const split = tableName.split(".");
  return split[split.length - 1];
};

export const createPostgresTableName = (
  tableName: string,
  schemaName: string,
): string => {
  if (tableName.includes(".")) return tableName;
  return `${schemaName}.${tableName}`;
};
