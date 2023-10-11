export const doltLogsQuery = `SELECT * FROM DOLT_LOG(?, '--parents') LIMIT ? OFFSET ?`;
