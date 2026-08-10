import { EntityManager } from "typeorm";
import { Built, escapeStringLiteral } from "./buildUtils";

export function buildCallProcedure(
  em: EntityManager,
  name: string,
  args: string[],
): Built<unknown> {
  const verb = ["postgres", "better-sqlite3"].includes(
    em.connection.options.type,
  )
    ? "SELECT"
    : "CALL";
  const argList = args.map(escapeStringLiteral).join(", ");
  const sql = `${verb} ${name}(${argList})`;
  return {
    sql,
    params: [],
    displaySql: sql,
    execute: async () => em.query(sql),
  };
}
