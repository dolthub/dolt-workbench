export const getThreeDotDiffStatQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM DOLT_DIFF_STAT(?${hasTableName ? `, ?` : ""})`;

export const getDiffStatQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM DOLT_DIFF_STAT(?, ?${hasTableName ? `, ?` : ""})`;
