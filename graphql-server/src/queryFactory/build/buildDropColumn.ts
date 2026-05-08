import { EntityManager } from "typeorm";
import { Built, escapeQualifiedIdentifier } from "./buildUtils";

export function buildDropColumn(
  em: EntityManager,
  target: string,
  columnName: string,
): Built<unknown> {
  const escape = em.connection.driver.escape.bind(em.connection.driver);
  const sql = `ALTER TABLE ${escapeQualifiedIdentifier(escape, target)} DROP COLUMN ${escape(columnName)}`;
  return {
    sql,
    params: [],
    displaySql: sql,
    execute: async () => em.query(sql),
  };
}
