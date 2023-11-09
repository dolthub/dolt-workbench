export const doltLogsQuery = `SELECT * FROM DOLT_LOG(?, '--parents') LIMIT ? OFFSET ?`;

export const twoDotDoltLogsQuery = `SELECT * FROM DOLT_LOG(?, '--parents')`;
