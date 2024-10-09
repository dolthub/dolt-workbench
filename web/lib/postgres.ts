export const getPostgresTableName = (tableName: string): string => {
  const split = tableName.split(".");
  return split[split.length - 1];
};
