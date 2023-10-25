export const schemaPatchQuery = `SELECT * FROM DOLT_PATCH(?, ?, ?) WHERE diff_type="schema"`;

export const schemaDiffQuery = `SELECT * FROM DOLT_SCHEMA_DIFF(?, ?, ?)`;
