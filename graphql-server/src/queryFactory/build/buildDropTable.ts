import { EntityManager } from "typeorm";
import { Built, escapeQualifiedIdentifier } from "./buildUtils";

export function buildDropTable(
  em: EntityManager,
  target: string,
): Built<unknown> {
  const escape = em.connection.driver.escape.bind(em.connection.driver);
  const sql = `DROP TABLE ${escapeQualifiedIdentifier(escape, target)}`;
  return {
    sql,
    params: [],
    displaySql: sql,
    execute: async () => em.query(sql),
  };
}
