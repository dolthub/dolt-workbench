import { DoltSystemTable } from "../systemTables/systemTable.enums";

export const getDoltSchemasQuery = (hasWhereCause = false): string =>
  `SELECT * FROM ${DoltSystemTable.SCHEMAS}${
    hasWhereCause ? " WHERE type = ?" : ""
  }`;

export const doltProceduresQuery = `SELECT * FROM ${DoltSystemTable.PROCEDURES}`;

export const getViewsQuery = `SELECT TABLE_SCHEMA, TABLE_NAME 
FROM information_schema.tables 
WHERE TABLE_TYPE = 'VIEW' AND TABLE_SCHEMA = ?`;

export const getTriggersQuery = `SHOW TRIGGERS`;

export const getEventsQuery = `SHOW EVENTS`;

export const getProceduresQuery = `SHOW PROCEDURE STATUS WHERE type = "PROCEDURE" AND db = ?`;
