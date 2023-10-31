import { DoltSystemTable } from "../systemTables/systemTable.enums";

export const getDoltSchemasQuery = (hasWhereCause = false): string =>
  `SELECT * FROM ${DoltSystemTable.SCHEMAS}${
    hasWhereCause ? " WHERE type = ?" : ""
  }`;

export const doltProceduresQuery = `SELECT * FROM ${DoltSystemTable.PROCEDURES}`;
