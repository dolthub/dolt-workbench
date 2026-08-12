export const getPostgresTableName = (tableName: string): string => {
  const split = tableName.split(".");
  return split[split.length - 1];
};

export const getPostgresSchemaName = (
  tableName: string,
): string | undefined => {
  const i = tableName.lastIndexOf(".");
  return i === -1 ? undefined : tableName.slice(0, i);
};

export const createPostgresTableName = (
  tableName: string,
  schemaName: string,
): string => {
  if (tableName.includes(".")) return tableName;
  return `${schemaName}.${tableName}`;
};
