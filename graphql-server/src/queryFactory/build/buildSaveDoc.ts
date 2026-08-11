import { EntityManager } from "typeorm";
import {
  Built,
  bindParam,
  interpolateForDisplay,
  newParamAccumulator,
} from "./buildUtils";

const DOC_NAME = "doc_name";
const DOC_TEXT = "doc_text";

export function buildSaveDoc(
  em: EntityManager,
  target: string,
  docName: string,
  markdown: string,
): Built<unknown> {
  const driver = em.connection.driver;
  const escape = driver.escape.bind(driver);
  const acc = newParamAccumulator();
  const pName = bindParam(acc, docName, "varchar");
  const pText = bindParam(acc, markdown, "varchar");

  const escapedTarget = escape(target);
  const escapedDocName = escape(DOC_NAME);
  const escapedDocText = escape(DOC_TEXT);

  const usesOnConflict = ["postgres", "better-sqlite3"].includes(
    em.connection.options.type,
  );
  const upsertClause = usesOnConflict
    ? `ON CONFLICT (${escapedDocName}) DO UPDATE SET ${escapedDocText} = :${pText}`
    : `ON DUPLICATE KEY UPDATE ${escapedDocText} = VALUES(${escapedDocText})`;
  const namedSql = `INSERT INTO ${escapedTarget} (${escapedDocName}, ${escapedDocText}) VALUES (:${pName}, :${pText}) ${upsertClause}`;

  const [sql, rawParams] = driver.escapeQueryWithParameters(
    namedSql,
    acc.namedParams,
    {},
  );
  const params = rawParams.map(p => String(p));
  const displaySql = interpolateForDisplay(sql, params, acc.paramTypes);

  return {
    sql,
    params,
    displaySql,
    execute: async () => em.query(sql, rawParams),
  };
}
