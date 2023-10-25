export const getDiffSummaryQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM DOLT_DIFF_SUMMARY(?, ?${hasTableName ? `, ?` : ""})`;

export const getThreeDotDiffSummaryQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM DOLT_DIFF_SUMMARY(?${hasTableName ? `, ?` : ""})`;
