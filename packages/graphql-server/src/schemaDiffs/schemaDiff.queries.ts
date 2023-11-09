export const schemaPatchQuery = `SELECT * FROM DOLT_PATCH(?, ?, ?) WHERE diff_type="schema"`;

export const threeDotSchemaPatchQuery = `SELECT * FROM DOLT_PATCH(?, ?) WHERE diff_type="schema"`;

export const schemaDiffQuery = `SELECT * FROM DOLT_SCHEMA_DIFF(?, ?, ?)`;

export const threeDotSchemaDiffQuery = `SELECT * FROM DOLT_SCHEMA_DIFF(?, ?)`;
